/* 
 * Copyright (C) 2015 Massimiliano Ghilardi.
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
    var MEM_BOX_MIN_WORDS = 4;
    m.MEM_BOX_HEADER_WORDS = 1; // boxed values have a 1-word header
 
    m.MEM_BOX_BIGNUM        = 6;  // box is a bignum. intentionally = MEM_TAG_BOX
 
    m.MEM_BOX_VECTOR        = 17; // box is a 1-dimensional array, i.e. a vector")
    m.MEM_BOX_STRING_UTF_21 = 18;
    m.MEM_BOX_STRING_UTF_8  = 19;
    m.MEM_BOX_ASCII_STRING  = 20; // box is an ASCII string
    // m.MEM_BOX_STRING        = m.MEM_BOX_STRING_UTF_8; // default string format is UTF-8
    m.MEM_BOX_STRING        = m.MEM_BOX_ASCII_STRING; // default string format is ASCII

    m.MEM_BOX_SYMBOL        = 22; // object is a symbol or keyword
 
    m.MEM_BOX_FIRST         = m.MEM_BOX_BIGNUM;
    m.MEM_BOX_LAST          = m.MEM_BOX_SYMBOL;
  
    m.MSIZE_BOX_FUNCTIONS = new Array(m.MEM_BOX_LAST-m.MEM_BOX_FIRST);
    m.MREAD_BOX_FUNCTIONS = new Array(m.MEM_BOX_LAST-m.MEM_BOX_FIRST);
    m.MWRITE_BOX_FUNCTIONS = new Array(m.MEM_BOX_LAST-m.MEM_BOX_FIRST);

    function box_type_error(ptr, index, boxed_type) {
        throw "the object at " + ptr + " + " + index + " declares to have type " + boxed_type + ",\n" +
            "which is not in the valid range " + m.MEM_BOX_FIRST + ".." + m.MEM_BOX_LAST + " for boxed types";
     };

    m.mwrite_internal_error = function(ptr, index, end_index, written_index) {
        var actual_words = written_index - index;
        var available_words = end_index - index;
        throw "Hyperluminal-mem error!\n" +
                "wrote " + actual_words + (actual_words === 1 ? " word" : " words") +
                " at " + ptr + " + " + index + "\n" +
                "but only " + available_words + (available_words === 1 ? " word was" : " words were") +
                " available at that location.\n" +
                "This is either a bug in hyperluminal-mem or in application code.";
    };

    function check_box_type(ptr, index, boxed_type) {
        boxed_type = boxed_type | 0;
        if (boxed_type < m.MEM_BOX_FIRST || boxed_type > m.MEM_BOX_LAST)
            box_type_error(ptr, index, boxed_type);
    }

    m.mdetect_box_type = function(value) {
        var type = typeof(value);
        if (type === "string")
            return m.MEM_BOX_STRING;
        else if (type ===  "object" && value.__proto__ === Array.prototype)
            return m.MEM_BOX_VECTOR;
    };

    // Round up N-WORDS to a multiple of MEM_BOX_MIN_WORDS
    function round_up_size(n_words) {
        return (n_words + 3) & -4;
    }
          
    // Return the number of words needed to store boxed VALUE in memory,
    // also including BOX header.
    // Rounds up the returned value to a multiple of +MEM-BOX/MIN-WORDS+"

    m.msize_box = function(index, value, boxed_type) {
        return m.MSIZE_BOX_FUNCTIONS[boxed_type - m.MEM_BOX_FIRST](index + m.MEM_BOX_HEADER_WORDS, value);
    };

    // Write a boxed value into the memory starting at (PTR+INDEX).
    // Also writes BOX header. Returns INDEX pointing to immediately after written value.
    m.mwrite_box = function(ptr, index, end_index, value, boxed_type) {
        var new_index = m.MWRITE_BOX_FUNCTIONS[boxed_type - m.MEM_BOX_FIRST](ptr, index + m.MEM_BOX_HEADER_WORDS, end_index, value);
        var actual_words = new_index - index;
        if (new_index > end_index) {
            mwrite_internal_error(ptr, index, end_index, new_index);
        }
        var n_words = round_up_size(actual_words);
        ptr[index] = (boxed_type << 27) | (n_words >>> 2); // divide n_words by MEM_BOX_MIN_WORDS
        return new_index;
    };
    
    // Read a boxed value from the memory starting at (PTR+INDEX).
    // Return the value, and set index_v[0] to one after the last read word
    m.mread_box2_v = function(ptr, index_v, end_index, boxed_type) {
        check_box_type(ptr, index_v[0], boxed_type);
        index_v[0] += m.MEM_BOX_HEADER_WORDS;
        return m.MREAD_BOX_FUNCTIONS[boxed_type - m.MEM_BOX_FIRST](ptr, index_v, end_index);
    };
})(hlmem);

