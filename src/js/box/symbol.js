/* 
 * Copyright (C) 2015 max.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301  USA
 */

/* global hlmem */

(function(m) {
    
    // Round up N-WORDS to a multiple of MEM_BOX_MIN_WORDS
    function round_up_size(n_words) {
        return (n_words + 3) & ~3;
    }

    function msize_box_symbol(index, sym) {
        // assume package name is the constant MEM_PKG_USER, which takes 1 word
        return m.msize_box_ascii_string(index + 1, sym);
    };
    
    function mwrite_box_symbol(ptr, index, end_index, sym) {
        // assume package name is the constant MEM_PKG_USER, which takes 1 word
        m.check_mem_overrun(ptr, index, end_index, 1);
        ptr[index++] = m.MEM_WORD_PKG_USER;
        return m.mwrite_box_ascii_string(ptr, index, end_index, sym);
    };
    
    function mread_box_symbol_v(ptr, index_v, end_index) {
        // read and ignore package name
        m.mread_v(ptr, index_v, end_index);
        return m.mread_box_ascii_string_v(ptr, index_v, end_index);
    };

    m.msize_symbol = function(index, value) {
        return msize_box_symbol(index + m.MEM_BOX_HEADER_WORDS, value);
    };

    m.mwrite_symbol = function(ptr, index, end_index, value) {
        var new_index = mwrite_box_symbol(ptr, index + m.MEM_BOX_HEADER_WORDS, end_index, value);
        var actual_words = new_index - index;
        if (new_index > end_index) {
            m.mwrite_internal_error(ptr, index, end_index, new_index);
        }
        var n_words = round_up_size(actual_words);
        ptr[index] = (m.MEM_BOX_SYMBOL << 27) | (n_words >>> 2); // divide n_words by MEM_BOX_MIN_WORDS
        return new_index;
    };
    m.mread_symbol_v = function(ptr, index_v, end_index) {
        var index = index_v[0];
        m.check_mem_length(ptr, index, end_index, 1);
        var n_words = (ptr[index++] & 0x7FFFFFF) << 2; // multiply by MEM_BOX_MIN_WORDS
        var end_box = index + n_words;
        if (end_index > end_box)
            end_index = end_box;
        index_v[0] = index + m.MEM_BOX_HEADER_WORDS;
        return mread_box_symbol_v(ptr, index_v, end_index);
    };
    
    m.MSIZE_BOX_FUNCTIONS[m.MEM_BOX_SYMBOL - m.MEM_BOX_FIRST] = msize_box_symbol;
    m.MWRITE_BOX_FUNCTIONS[m.MEM_BOX_SYMBOL - m.MEM_BOX_FIRST] = mwrite_box_symbol;
    m.MREAD_BOX_FUNCTIONS[m.MEM_BOX_SYMBOL - m.MEM_BOX_FIRST] = mread_box_symbol_v;

})(hlmem);


