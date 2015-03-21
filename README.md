Hyperluminal-mem-js
===================

Summary
-------
Hyperluminal-mem-js is a high-performance serialization/deserialization library
for Javascript, designed for untrusted data.

It uses the same serialized data format as Common Lisp library
[Hyperluminal-mem](https://github.com/cosmos72/hyperluminal-mem)
making it ideal to exchange complex data structures between Javascript
and Common Lisp across the network.

Features
--------
Hyperluminal-mem-js is designed and optimized for the following objectives:
- speed: serializing and deserializing data uses Javascript typed arrays
- safety: it can be used on untrusted and possibly malicious data,
  as for example serialized packets or files received from the internet.
- portability: the serialization format is portable.
  This Javascript implementation always uses 32-bit data format
  with native endianity.
  The Common Lisp equivalent also supports 64-bit format
  and defaults to little-endian endianity.
  Conversion between little and big endian formats is trivial.
- ease of use: adding support for user-defined types is usually
  straightforward (This is currently unimplemented)

### News, 21st March 2015

Initial implementation. Supports the following Javascript types:
* integers up to 30 bits
* arrays
* the constants true, false, null and undefined

Support the following types is not yet implemented:
* integers larger than 30 bits
* floating point values
* strings
* objects


Installation and loading
------------------------

At the moment, you need to manually include the following files (order is important!) :
* [js/module.js](src/js/module.js)
* [js/word.js](src/js/word.js)
* [js/unboxed.js](src/js/unboxed.js)
* [js/boxed.js](src/js/boxed.js)
* [js/box/vector.js](src/js/box/vector.js)
* [js/main.js](src/js/main.js)
* [js/debug.js](src/js/debug.js)
  

### Testing that it works

No test suite yet...

Basic usage
-----------

Hyperluminal-mem-js offers the following functions, defined in the
global `hlmem` object:

- `malloc_words(n_words)` allocates a Uint32Array memory block and returns it.

- `msize(index, value)` examines a Javascript value, and tells
   how many words of memory are needed to serialize it.

   It is useful to know how large a memory block must be
   in order to write a serialized value into it.

   The argument `index` is useful to compute the total size of composite values,
   as for example arrays and objects: the value returned by `msize`
   is increased by the value of `index`, so the following three code snippets are equivalent

        return hlmem.msize(0, [1,2]) + hlmem.msize(0 [3,4]);

        var index = hlmem.msize(0, [1,2]);
        return hlmem.msize(index, [3,4]);

        return msize(msize(0, [1,2]), [3,4]);

   with the advantage that the second and third versions automatically check
   for length overflows and can exploit tail-call optimizations.

   `msize` supports the same types as `mwrite` below, and can be extended similarly
   to support arbitrary types, see `msize-object` and `mwrite-object` for details.
   
- `mwrite(ptr, index, end_index, value)` serializes a Javascript value, writing it into memory.

   To use it, you need three things beyond the value to serialize:
   * a memory block, obtained for example with `malloc_words()` described above.
   * the offset (in words) where you want to write the serialized value.
     It must be passed as the `index` argument
   * the available length (in words) of the memory block.
     It must be passed as the `end_index` argument
   
   `mwrite` returns an offset pointing immediately after the serialized value.
   This allows to easily write consecutive serialized values into memory.
   
   `mwrite` currently supports the following Javascript types:
   * integers up to 30 bits, i.e. in the range -0x20000000 .. 0x1fffffff
   * arrays
   * the constants `true`, `false`, `null` and `undefined`
  
   Support for the following types is not yet implemented:
   * integers larger than 30 bits
   * floating point values
   * strings
   * objects, using `mwrite_object`

- `mread(ptr, index, end_index)` deserializes a Javascript value, reading it from memory.

   It returns an array of two values: the value itself, and an offset pointing
   immediately after the serialized value inside raw memory. This allows
   to easily read consecutive serialized values from the memory.

   `mread` supports the same types as `mwrite` and it can be extended similarly,
   see `mread-object` and `mwrite-object` for details.

- `msize_object(object, index)` is a function that examines an object
   and tells how many words of raw memory are needed to serialize it.

   Not yet implemented...

- `mread_object(type, ptr, index, end_index)` is a function that reads
   a serialized object from memory, deserializes and returns it.

   Not yet implemented...

- `mwrite_object(object, ptr, index, end_index)` is a function
   that serializes an object, writing it into raw memory.

   Not yet implemented...

- `version()` is a function that returns the current version of
  Hyperluminal-mem-js. The returned value is an array having the form
  `[major, minor, patch]` as for example `[0, 5, 2]`


Serialization format and ABI
----------------------------
  
Hyperluminal-mem-js uses 32-bit serialization format with native endianity.
It is currently not possible to override such settings.

------
As of March 2015, Hyperluminal-mem-js is being written by Massimiliano Ghilardi
and it is considered by the author to be in ALPHA status.


Contacts, help, discussion
--------------------------
As long as the traffic is low enough, [GitHub Issues](https://github.com/cosmos72/hyperluminal-mem-js/issues)
can be used to report test suite failures, bugs, suggestions, general discussion etc.

If the traffic becomes high, more appropriate discussion channels will be set-up.

The author will also try to answer support requests, but gives no guarantees.


Legal
-----
Hyperluminal-mem-js is released under the terms of the
[GNU Lesser General Public License v3.0](https://www.gnu.org/licenses/lgpl-3.0.txt),
known as LGPL.
