# nqm-wrangler-nquirer-mappings

## Description
This Wrangler is to re-build mapping dataset for NQR, re-generate the dataset on tdx: https://q.nq-m.com/v1/datasets/B1eUF5s2Ul/data

## Usage
run as a databot with index.js file, the default input schema of the databot is like this:

e.g.
```json
"inputSchema": {
  "mappingType": ,
  "period":"10-2016",
  "sourceFilePath":"",
  "sourceResource":"",
  "sourceURL":"",
},
"outputSchema": {
},
"packageParams": {
    "timerFrequency":60000,
    "accessTokenTTL":31536000
}

```

"mappingType" should be on of the default mapping types, which could be checked in "./lib/wrangler-factory.js"

```json
"serviceIdToLsoa": "serviceId-to-lsoa.js",
"patients-mapping": "ccg-to-lsoa.js",
"service-mapping"" ccg-to-serviceId.js",
"ons-mapping-new": "ons-mapping.js",
"ons-mapping": "csv-direct-mapping.js",
"cty15cd-lsoa11cd": "cty15cd-lsoa11cd",
"gp-ratio": "gp-ratio.js",
"ratio-calculations": "ratio-calculations.js",
"schools-ratio": "./schools/ratio-calculations"
```
### serviceIdToLsoa mappingType
This mapping module generates the mapping between "PRACTICE_CODE" and "LSOA11CD" codes. In this case, it maps the lsoas where all patients come from, and registered in on GP practice code.

#### input schema:
```json
{
  "PRACTICE_CODE": {
    "type": ["string"]
  },
  "lsoa1": {
    "type": ["string"]
  },
  "lsoa2": {
    "type": ["string"]
  },
  ...
}

```
Unknown number of lsoa fields, depending on which line csv-parser is currently streaming.

#### output schema

```json
{
  "parentId":{
    "type":["string"]
  },
  "childId": {
    "type": ["string"]
  },
  "parentType":{
    "type": ["string"]
  },
  "childType": {
    "type": ["string"]
  },
  "mappingType": {
    "type": ["string"]
  }
}
```
"parentType" here is "RACTICE_CODE", "childType" is "LSOA11CD"

### ons-mapping-new - ons-mapping
This mapping module maps new ccg codes "CCG16CD" with all the LSOA codes inside this ccg area.

```javascript
const Wrangler = require("ons-mapping-new.js");
const mappingString = "ccg16cd-lsoa11cd";
const mappingType = "ons-mapping"
```

local source file is: LSOA11_CCG16_LAD16_EN_LU.csv

tbx file dataset: ByWqFWX5tx

#### input schema

```json
{
  "LSOA11CD":{
    "type": ["string"]
  },
  "LSOA11NM": {
    "type": ["string"]
  },
  "CCG16CD": {
    "type": ["string"]
  },
  "CCG16NM": {
    "type": ["string"]
  }
}
```

#### output schema

```json
{
  "parentId": {
    "type": ["string"]
  },
  "childId": {
    "type": ["string"]
  },
  "parentType": {
    "type": ["string"]
  },
  "childType": {
    "type": ["string"]
  },
  "parentName": {
    "type": ["string"]
  },
  "childName": {
    "type": ["string"]
  }
}
```
### other ons-mapping
```javascript
const Wrangler = require("csv-direct-mapping.js");
const mappingString = ...
```
The source files for each different ons-mapping are:

**"ccg15cd-lsoa11cd":**

  * **local file**: LSOA11_CCG15_LAD15_EN_LU
  * **tdx resource Id**: "HJlJKfKntl"

**"lad15cd-wd15cd":**
  * **local file**: WD15_LAD15_UK_LU.csv
  * **tdx resource Id:** "ByeXHPK3tg"

**"lad11cd-wd11cd":**
  * **local file:** WD11_CMWD11_LAD11_EW_LU.csv
  * **tdx resource Id:** "HygBx_t3Yg"

**"cty15cd-lad15cd"**
  * **local file:** LAD15_CTY15_EN_LU.csv
  * **tdx resource Id:**"rJlhauthYx"

**"lad15cd-lsoa11cd"**
  * **local file**: Lower_Layer_Super_Output_Area_2011_to_Ward_2015_Lookup_in_England_and_Wales.csv
  * **tdx resource Id:**"Byx_3KKntg"

#### output schema
```json
{
  "parentId": {
    "type": ["string"]
  },
  "childId": {
    "type": ["string"]
  },
  "parentType": {
    "type": ["string"]
  },
  "childType": {
    "type": ["string"]
  },
  "parentName": {
    "type": ["string"]
  },
  "childName": {
    "type": ["string"]
  }
}
```

### cty15cd-lsoa11cd
This module read from outcomes from other ons-mapping, cty15cd-lad15cd and lad15cd-lsoa11cd.

on tbx, now the outcome dataset id of other ons-mapping is: S1xZmffiKx

```javascript
const Wrangler = require("cty15cd-lsoa11cd");
```
### schemas

both input& output schemas are the same as other ons-mapping schemas.

### ccg-serviceId
This module maps with all serviceIds in one defined CCG area.

```javascript
const Wrangler = require("/ccg-to-serviceId");
```
#### input sources
**input file:** gp-reg-patients-prac-sing-year-age.csv

**tdx resource Id**: ryegnTW9Fg

#### output schema
```json
{
  "parentId": {
    "type": ["string"]
  },
  "childId": {
    "type": ["string"]
  },
  "parentType": {
    "type": ["string"]
  },
  "childType": {
    "type": ["string"]
  },
  "parentName": {
    "type": ["string"]
  },
  "childName": {
    "type": ["string"]
  }
}
```

##### ? issues
* originally count of LAD15CD-WD15CD: 8363, now is 9196, check the raw file in .csv
* originally count of LAD15CD-LSOACD: 32844, now is 34754, check the raw file in .csv, there are in total 34754 LSOA11CD code

##### ratios to each GP service from each LSOA each demographic
* pople-each-gp-calculator: 

  >Files: "gp-reg-patients-LSOA-FEMALE", "gp-reg-patients-LSOA-MALE" 

  ##### output json format
```json
  {
    "area_id":"E01012187",
    "gender":"female",
    "persons":{
      "A81001":10,
      "A81002":12,  ...
    }
  }
  ```

* people-each-lsoa-calculator

  >Files: "gp-reg-patients-LSOA-FEMALE","gp-reg-patients-LSOA-MALE"
  
  ##### output json format
```json
  {
    "area_id":"E01012187",
    "gender":"female",
    "persons":300
  }
```

* ratio-each-service: "ratio-each-service.js"

  >File sources on tdx
  >* gp-reg-patients-LSOA-FEMALE,"HJx0Heritg"
  >* gp-reg-patients-LSOA-MALE, "SyXw0PXsFg"

* "age-ratio":"age-ratio-each-lsoa.js"
  >dataset resource on tdx:
  >* datasetId: "ryegnTW9Fg"

* gp-ratio: "gp-ratio.js"
  >dataset resource on tdx is https://q.nq-m.com/v1/datasets/rJxW_XsN5g/data
  > the dataset coming from the output results from 
    > * ratio-each-service: "ratio-each-service.js"
    > * "age-ratio":"age-ratio-each-lsoa.js"


* "ccg16cd-to-lsoa11cd"

  >dataset resource on tdx:
  >* "ccg16cd-to-serviceId": (input first)
  >* "serviceId-to-lsoa11cd": mapping serviceIds with registered patients lsoas
  

* school importer
  lib/schools/line-parser.js  
* school ratio calculations
  * for tsv raw file tr '\t' ',' < file.tsv > file.csv
  lib/schools/ratio-calculations.js (raw file "Autumn_Census_2013.csv")
