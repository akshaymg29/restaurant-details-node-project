# Convert ZIP to GPS
#### January 18th, 2019

### _Jared Reando_
## Description
Convert any U.S. zip code into approximate GPS coordinates. Useful for translating user form input into data more compatible with most geolocation/map interfaces and APIs.

Accuracy is relative, as returned GPS coordinates are the center point of each ZIP area, as defined by US Census Bureau data.

## Setup
Add to project:
```
    npm install convert-zip-to-gps --save
```
Require in applicable project files:
```
    let convert = require('convert-zip-to-gps');
```

## Usage
Called function will return GPS coordinates for valid U.S. 5-digit ZIP codes, entered as integers or strings.
```
    let zip = 97230;

    convert.zipConvert(zip);
```
Returned value:
```
    '45.557757,-122.505268'
```

## Limitations
- Matches are approximate GPS coordinates.
- Simple ZIP validation only assesses length. Match failure will result in return value 'undefined'
- International ZIP codes not supported (U.S. only)

## Data Source

- Zip codes from US Census Bureau (Census.gov › Geography › Maps & Data › Gazetteer Files › 2017 U.S. Gazetteer Files)
http://www.census.gov/geo/maps-data/data/gazetteer2017.html
- Modeled after [gps2zip](https://www.npmjs.com/package/Gps2zip) NPM module by [Nick Carneiro](https://github.com/NickCarneiro/)

## Contact
Email: jaredreando@gmail.com

## Legal
Copyright 2019 Jared Reando (MIT License):

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
