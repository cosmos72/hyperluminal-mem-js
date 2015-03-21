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

    function msize_box_vector(index, vector) {
        // 1 word to store vector length
        index++;
        for (var i = 0, n = vector.length; i < n; i++) {
            index = m.msize(index, vector[i]);
        }
        return index;
    };
    
    function mwrite_box_vector(ptr, index, end_index, vector) {
        // 1 word to store vector length
        m.check_mem_overrun(ptr, index, end_index, 1);
        var len = vector.length;
        m.mset_int(ptr, index++, len);
        
        for (var i = 0; i < len; i++) {
            index = m.mwrite(ptr, index, end_index, vector[i]);
        }
        return index;
    };
    
    function mread_box_vector_v(ptr, index_v, end_index) {
        var index = index_v[0];
        // 1 word to store vector length
        m.check_mem_length(ptr, index, end_index, 1);
        var len = m.mget_int(ptr, index);
        index_v[0] = index+1;
        
        var vector = new Array(len);
        for (var i = 0; i < len; i++) {
             vector[i] = m.mread_v(ptr, index_v, end_index);
        }
        return vector;
    };

    m.MSIZE_BOX_FUNCTIONS[m.MEM_BOX_VECTOR - m.MEM_BOX_FIRST] = msize_box_vector;
    m.MWRITE_BOX_FUNCTIONS[m.MEM_BOX_VECTOR - m.MEM_BOX_FIRST] = mwrite_box_vector;
    m.MREAD_BOX_FUNCTIONS[m.MEM_BOX_VECTOR - m.MEM_BOX_FIRST] = mread_box_vector_v;

})(hlmem);

