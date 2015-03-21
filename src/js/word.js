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
    m.msizeof_word = 4;

    m.malloc_words = function(n_words) {
        var buf = new ArrayBuffer(n_words * m.msizeof_word);
        return new Uint32Array(buf);
    };

    /* defined for compatibility. Javascript idiomatic syntax is ptr[i] */
    m.mget_word = function(ptr, index) {
        return ptr[index];
    };

    /* defined for compatibility. Javascript idiomatic syntax is ptr[i] = value */
    m.mset_word = function(ptr, index, value) {
        ptr[index] = value;
    };
    
    function mem_overrun_error(ptr, index, end_index, n_words) {
        var available_words = end_index - index;
        throw "attempt to write " + n_words + " " + (n_words === 1 ? "word" : "words") +
            " at " + ptr + " + " + index + ", but only " + available_words +
            (available_words === 1 ? " word" : " words") + " available at that location";
    };

    function mem_length_error(ptr, index, end_index, n_words) {
        var available_words = end_index - index;
        throw "the object at " + ptr + " + " + index + " declares to be " +
                n_words + (n_words === 1 ? " word" : " words") + " long, but only " +
                available_words + (available_words === 1 ? " word" : " words") + " available at that location";
    };

    m.check_mem_overrun = function(ptr, index, end_index, n_words) {
        if (n_words > end_index - index)
            mem_overrun_error(ptr, index, end_index, n_words);
    };

    m.check_mem_length = function(ptr, index, end_index, n_words) {
        if (n_words > end_index - index)
            mem_length_error(ptr, index, end_index, n_words);
    };
    
})(hlmem);
