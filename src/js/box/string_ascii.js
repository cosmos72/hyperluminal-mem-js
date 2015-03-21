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

    function msize_box_ascii_string(index, str) {
        // 1-word length prefix, and round up required bytes to a whole word
        return index + 1 + ((str.length + 3) >>> 2);
    };
    
    function mwrite_box_ascii_string(ptr, index, end_index, str) {
        var n_chars = str.length;
        // 1 word to store string length
        var n_words = 1 + ((n_chars + 3) >>> 2);
        m.check_mem_overrun(ptr, index, end_index, n_words);
        
        m.mset_int(ptr, index++, n_chars);

        var n_chars_truncate = n_chars & ~3;
        for (var i = 0; i < n_chars_truncate; i += 4) {
            ptr[index++] = str.charCodeAt(i) | (str.charCodeAt(i+1) << 8) |
                    (str.charCodeAt(i+2) << 16) | (str.charCodeAt(i+3) << 24);
        }
        var n_chars_remainder = n_chars & 3;
        if (n_chars_remainder !== 0) {
            var word = 0;
            for (var i = 0; i < n_chars_remainder; i++) {
                word = word | (str.charCodeAt(n_chars_truncate + i) << (i << 3));
            }
            ptr[index++] = word;
        }
        return index;
    };
    
    function mread_box_ascii_string_v(ptr, index_v, end_index) {
        var index = index_v[0];
        // 1 word to store string length
        m.check_mem_length(ptr, index, end_index, 1);
        var n_chars = m.mget_int(ptr, index++);
        var n_words = (n_chars + 3) >>> 2;
        m.check_mem_length(ptr, index, end_index, n_words);
        
        var vector = new Array(n_chars);
        var n_chars_truncate = n_chars & ~3;
        for (var i = 0; i < n_chars_truncate; i += 4) {
             var word = ptr[index++];
             vector[i] = word & 0xFF;
             vector[i+1] = (word >>> 8) & 0xFF;
             vector[i+2] = (word >>> 16) & 0xFF;
             vector[i+3] = (word >>> 24) & 0xFF;
        }
        var n_chars_remainder = n_chars & 3;
        if (n_chars_remainder !== 0) {
            var word = ptr[index++];
            for (var i = 0; i < n_chars_remainder; i++) {
                vector[n_chars_truncate + i] = word & 0xFF;
                word = word >>> 8;
            }
        }
        index_v[0] = index;
        return String.fromCharCode.apply(null, vector);
    };

    m.MSIZE_BOX_FUNCTIONS[m.MEM_BOX_ASCII_STRING - m.MEM_BOX_FIRST] = msize_box_ascii_string;
    m.MWRITE_BOX_FUNCTIONS[m.MEM_BOX_ASCII_STRING - m.MEM_BOX_FIRST] = mwrite_box_ascii_string;
    m.MREAD_BOX_FUNCTIONS[m.MEM_BOX_ASCII_STRING - m.MEM_BOX_FIRST] = mread_box_ascii_string_v;

})(hlmem);

