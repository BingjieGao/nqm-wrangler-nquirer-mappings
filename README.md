# nqm-wrangler-nquirer-mappings

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
* "ons-mapping" upload to dataset, dataset Id is S1xZmffiKx
  * "ccg15cd-lsoa11cd":"HJlJKfKntl",
  * "lad15cd-wd15cd":"ByeXHPK3tg",
  * "lad11cd-wd11cd":"HygBx_t3Yg",
  * "cty15cd-lad15cd":"rJlhauthYx",
  * "lad15cd-lsoa11cd":"Byx_3KKntg"
  * for mapping CTY15CD to LSOA11CD 
    * "cty15cd-lsoa11cd":"" --> ons-mapping dataset Id: S1xZmffiKx, this is a sourceURL
##### ratios to each GP service from each LSOA each demographic
* pople-each-gp-calculator: "gp-reg-patients-LSOA-FEMALE", "gp-reg-patients-LSOA-MALE" 
  {
    "area_id":"E01012187",
    "gender":"female",
    "persons":{
      "A81001":10,
      "A81002":12,  ...
    }
  }

* people-each-lsoa-calculator:"gp-reg-patients-LSOA-FEMALE", "gp-reg-patients-LSOA-MALE"
  {
    "area_id":"E01012187",
    "gender":"female",
    "persons":300
  }
* ratio-each-service: "ratio-each-service.js"
* gp-reg-patients-LSOA-FEMALE,"HJx0Heritg"
* gp-reg-patients-LSOA-MALE, "SyXw0PXsFg"
##### ? issues
* originally count of LAD15CD-WD15CD: 8363, now is 9196, check the raw file in .csv
* originally count of LAD15CD-LSOACD: 32844, now is 34754, check the raw file in .csv, there are in total 34754 LSOA11CD code