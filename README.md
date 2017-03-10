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

```



##### databot input
different mappingType "inputSchema"
e.g.

```javascript
mappingType:"serviceIdToLsoa"
```
mappingType is one of "defaultMappingTypes"
defaultMappingTypes and corresponding tdx file resource ids are: 
* "serviceIdToLsoa":"HJeVgCnYtg",
* "ons-mapping-new":"ByWqFWX5tx",
* "ccg-serviceId":"ryegnTW9Fg",
* "ons-mapping" upload to dataset, dataset Id is S1xZmffiKx
  * "ccg15cd-lsoa11cd":"HJlJKfKntl",
  * "lad15cd-wd15cd":"ByeXHPK3tg",
  * "lad11cd-wd11cd":"HygBx_t3Yg",
  * "cty15cd-lad15cd":"rJlhauthYx",
  * "lad15cd-lsoa11cd":"Byx_3KKntg"
* for mapping CTY15CD to LSOA11CD(one of ons-mapping datasets)
    * "cty15cd-lsoa11cd":"" --> ons-mapping dataset Id: S1xZmffiKx, this is a sourceURL on tdx

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
##### ? issues
* originally count of LAD15CD-WD15CD: 8363, now is 9196, check the raw file in .csv
* originally count of LAD15CD-LSOACD: 32844, now is 34754, check the raw file in .csv, there are in total 34754 LSOA11CD code