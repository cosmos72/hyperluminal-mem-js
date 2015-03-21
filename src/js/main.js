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
    m.msize = function(index, value, optional_boxed_type) {
        if (m.is_unboxed(value))
            return index + 1;
        var boxed_type = optional_boxed_type || m.mdetect_box_type(value);
        if (boxed_type !== undefined)
            return m.msize_box(index, value, boxed_type);
    };

    m.mwrite = function(ptr, index, end_index, value, optional_boxed_type) {
        m.check_mem_overrun(ptr, index, end_index, 1);
        if (m.mset_unboxed(ptr, index, value))
            return index + 1;
        var boxed_type = optional_boxed_type || m.mdetect_box_type(value);
        if (boxed_type !== undefined)
            return m.mwrite_box(ptr, index, end_index, value, boxed_type);
    };

    m.mread_v = function(ptr, index_v, end_index) {
        var index = index_v[0];
        m.check_mem_length(ptr, index, end_index, 1);
        var value = m.mget_unboxed(ptr, index);
        // Javascript null is an object :(
        if (value === null || typeof(value) !== "object")
        {
            index_v[0] = index + 1;
            return value;
        }
        var n_words = value[1] << 2; // multiply by MEM_BOX_MIN_WORDS
        var end_box = index + n_words;
        if (end_index > end_box)
            end_index = end_box;
        var boxed_type = value[0];
        if (boxed_type < m.MEM_BOX_LAST)
            return m.mread_box2_v(ptr, index_v, end_index, boxed_type);
    };

    m.mread = function(ptr, index, end_index) {
        var index_v = [index, null];
        var value = m.mread_v(ptr, index_v, end_index);
        index_v[1] = index_v[0];
        index_v[0] = value;
        return index_v;
    };
})(hlmem);
