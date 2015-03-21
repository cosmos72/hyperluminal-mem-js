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
    m.console = m.console || {};
    m.console.write = function(str) {
        console.log(str);
    };
    m.default_writer = m.console;
    m.to_writer = function(obj) {
        var ret = obj;
        if (obj === false || obj === null || typeof(obj) === "undefined")
            ret = m.default_writer;
        else if (obj === true)
            ret = m.console;
        else if (typeof(obj) === "object") {
            if (obj.tagName === "TEXTAREA") {
                ret = {};
                ret.write = function(str) {
                    obj.value = obj.value + str;
                };
            }
        }
        return ret;
    };
    m.set_default_writer = function(obj) {
        m.default_writer = m.to_writer(obj);
    };
    
    function inspect_object(out, obj) {
        while (obj !== null)
        {
            var type = typeof(obj);
            if (type === "undefined")
                return;
            if (obj === Array.prototype)
            {
                out.write("is Array\n");
            }
            if (type !== "object")
                return;
            
            for (var key in obj) {
                out.write("obj." + key + " = " + obj[key] + "\n");
            }
            obj = obj.__proto__;
        }
    };
    m.inspect = function(out, obj) {
        out = m.to_writer(out);
        out.write("obj = " + obj + "\n");
        out.write("typeof(obj) = " + typeof(obj) + "\n");
        inspect_object(out, obj);
    };

    function is_array(obj) {
        return typeof(obj) === "object" && obj.__proto__ === Array.prototype;
    }

    function print_number(out, obj) {
        out.write(obj.toString());
    };
    
    function print_string(out, obj) {
        out.write("\"");
        out.write(obj.replace("\"", "\"\""));
        out.write("\"");
    };

    function print_array(out, obj) {
        out.write("[");
        for (var i = 0, n = obj.length; i < n; i++) {
            if (i !== 0)
                out.write(", ");
            print_any(out, obj[i]);
        }
        out.write("]");
    };

    function print_object(out, obj) {
        out.write("{");
        var next = false;
        for (var key in obj) {
            if (next)
                out.write(", ");
            next = true;
            print_any(out, key);
            out.write(":");
            print_any(out, obj[key]);
        }
        out.write("}");
    };

    function print_any(out, obj) {
        var type = typeof(obj);
        if (obj === null)
            out.write("null");
        else if (obj === undefined)
            out.write("undefined");
        else if (obj === false)
            out.write("false");
        else if (obj === true)
            out.write("true");
        else if (type === "number")
            print_number(out, obj);
        else if (type === "string")
            print_string(out, obj);
        else if (is_array(obj))
            print_array(out, obj);
        else
            print_object(out, obj);
    };
    
    m.print = function(out, obj) {
        out = m.to_writer(out);
        return print_any(out, obj);
    };
    
    function dump_word(out, value) {
        var nchars = m.msizeof_word * 2;
        var str = value.toString(16);
        if (str.length < nchars)
            out.write("00000000".substring(str.length));
        out.write(str);
    };

    m.mdump_word = function(out, value) {
        out = m.to_writer(out);
        dump_word(out, value);
    };

    m.mdump = function(out, ptr, start_index, end_index) {
        out = m.to_writer(out);
        for (var i = start_index; i < end_index; i++) {
            if (i !== 0)
                out.write(" ");
            dump_word(out, ptr[i]);
        }
    };
})(hlmem);
