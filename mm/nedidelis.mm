$(
  Copyright 2022 Google LLC

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
$)

      $c wff |- p q - $.
      $v x y z $.
      wx $f wff x $.
      wy $f wff y $.
      wz $f wff z $.

      $( 1 is a wff $)
      w0 $a wff - $.          

      $( n is a wff $)
      w1 $a wff x - $.

      $( 2 is a wff $)
      t0 $a wff - - $.

      $( 3 is a wff $)
      t1 $a wff - - - $.

      $( x + - = x - $)
      ax0 $a |- x p - q x - $.

      $( 1 + 1 = 2 $)
      t2 $p |- - p - q - - $= w0 ax0 $.

      $( 2 + 1 = 3 $)
      t3 $p |- - - p - q - - - $= w0 w1 ax0 $.

      $( 3 + 1 = 4 $)
      t4 $p |- - - - p - q - - - - $= w0 w1 w1 ax0 $.

      $( if x + y = z then x + y + 1 = z + 1 $)
      ${
        ax1.1 $e |- x p y q z $.
        ax1 $a |- x p y - q z - $.
      $}

      $( 1 + 2 = 3 $)
      
      t5 $p |- - p - - q - - - $= 
        w0             $( x = -, i.e. 1 $)
        w0             $( y = -, i.e. 1 $)
        w0 w1          $( z = - -, i.e. 2 $)
        w0 ax0         $( |- - p - q - -, i.e. 1 + 1 = 2 $)
        ax1            $( |- - p - - q - - - , i.e. 1 + 2 = 3 $)
        $.

      $( 1 + 3 = 4 $)
      t6 $p |- - p - - - q - - - - $= 
        w0             $( x = -, i.e. 1 $)
        w0 w1          $( y = - -, i.e. 2 $)
        w0 w1 w1       $( z = - - -, i.e. 3 $)
        t5             $( |- - p - - q - - -, i.e. 1 + 2 = 3 $)
        ax1            $( |- - p - - - q - - - -, i.e. 1 + 3 = 4 $)
        $.