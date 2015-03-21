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
    
    var MEM_TAG_SYMBOL = 0;

    var MEM_SYM_FALSE = 0;     // persistent representation of false
    var MEM_SYM_TRUE  = 1;     // persistent representation of true
    var MEM_SYM_UNDEFINED = 2; // persistent representation of undefined
    var MEM_SYM_NULL  = 980;   // persistent representation of null

    m.is_unboxed = function(value) {
        if (value === null || value === undefined || value === true || value === false)
            return true;
        if (typeof(value) === "number")
            return value|0 === value && value >= -0x20000000 && value <= 0x1fffffff;
        return false;
    };
    
    m.mset_int = function(ptr, index, value) {
        ptr[index] = 0xC0000000 | value;
    };

    m.mget_int = function(ptr, index) {
        return (ptr[index] & 0x1FFFFFFF) - (ptr[index] & 0x20000000);
    };

    m.mset_unboxed = function(ptr, index, value) {
        var tag = MEM_TAG_SYMBOL, vid = MEM_SYM_FALSE;
        
        if (value === null)
            vid = MEM_SYM_NULL;
        else if (value === undefined)
            vid = MEM_SYM_UNDEFINED;
        else if (value === false)
            vid = MEM_SYM_FALSE;
        else if (value === true)
            vid = MEM_SYM_TRUE;
        else if (typeof(value) === "number" && value|0 === value && value >= -0x20000000 && value <= 0x1fffffff)
        {
            ptr[index] = 0xC0000000 | value;
            return true;
        }
        else
            return false;
        ptr[index] = (tag << 27) | vid;   
        return true;
    };
    
    m.mget_unboxed = function(ptr, index) {
        var word = ptr[index];
        
        if ((word >>> 30) === 3)
        {
            return (word & 0x1FFFFFFF) - (word & 0x20000000);
        }
        var tag = word >>> 27, vid = word & 0x7FFFFFF;
        
        if (tag === MEM_TAG_SYMBOL)
        {
            switch (vid) {
                case MEM_SYM_FALSE:     return false;
                case MEM_SYM_TRUE:      return true;
                case MEM_SYM_UNDEFINED: return undefined;
                case MEM_SYM_NULL:      return null;
            }
        }
        return [tag, vid];
    };
})(hlmem);
