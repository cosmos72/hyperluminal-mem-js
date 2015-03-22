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
    m.MEM_OBJ = m.MEM_BOX_LAST + 1; // 23
    
    m.MPROPERTIES_OBJ_FUNCTIONS = {null:function (obj) { return obj; }};

    function mproperties_obj(obj, type) {
        return m.MPROPERTIES_OBJ_FUNCTIONS[type](obj);
    };
    
    // Round up N-WORDS to a multiple of MEM_BOX_MIN_WORDS
    function round_up_size(n_words) {
        return (n_words + 3) & ~3;
    }

    function msize_object(index, obj, type) {
        for (var key in mproperties_obj(obj, type)) {
            index = m.msize_symbol(index, key);
            index = m.msize(index, obj[key]);
        }
        return index + 1; // for final null
    };
    
    function mwrite_object(ptr, index, end_index, obj, type) {
        for (var key in mproperties_obj(obj, type)) {
            index = m.mwrite_symbol(ptr, index, end_index, key);
            index = m.mwrite(ptr, index, end_index, obj[key]);
        }
        ptr[index++] = m.MEM_WORD_NULL;
        return index;
    };

    function mread_object_v(ptr, index_v, end_index, type) {
        var obj = {};
        var null_word = m.MEM_WORD_NULL;
        for (;;) {
            if (ptr[index_v[0]] === null_word)
                break;
            var key = m.mread_symbol_v(ptr, index_v, end_index);
            obj[key] = m.mread_v(ptr, index_v, end_index);
        }
        return obj;
    };
    
    m.MSIZE_OBJ_FUNCTIONS = {null:msize_object};
    m.MWRITE_OBJ_FUNCTIONS = {null:mwrite_object};
    m.MREAD_OBJ_FUNCTIONS = {null:mread_object_v};
    
    function mtypeof_obj(obj) {
        if (obj.hlmem_mtypeof !== undefined)
            return obj.hlmem_mtypeof();
        return null;
    };
    
    m.msize_obj = function(index, obj) {
        var type = mtypeof_obj(obj);
        
        index += m.MEM_BOX_HEADER_WORDS;
        index = m.msize(index, type);
        return m.MSIZE_OBJ_FUNCTIONS[type](index, obj, type);
    };

    m.mwrite_obj = function(ptr, index, end_index, obj) {
        var type = mtypeof_obj(obj);

        var new_index = index + m.MEM_BOX_HEADER_WORDS;
        new_index = m.mwrite(ptr, new_index, end_index, type);
        new_index = m.MWRITE_OBJ_FUNCTIONS[type](ptr, new_index, end_index, obj, type);

        if (new_index > end_index) {
            m.mwrite_internal_error(ptr, index, end_index, new_index);
        }
        var actual_words = new_index - index;
        var n_words = round_up_size(actual_words);
        ptr[index] = (m.MEM_OBJ << 27) | (n_words >>> 2); // divide n_words by MEM_BOX_MIN_WORDS
        return new_index;
    };

    m.mread_obj_v = function(ptr, index_v, end_index) {
        index_v[0] += m.MEM_BOX_HEADER_WORDS;
        var type = m.mread_v(ptr, index_v, end_index);
        return m.MREAD_OBJ_FUNCTIONS[type](ptr, index_v, end_index, type);
    };
})(hlmem);
