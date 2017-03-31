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

**local source file is:** LSOA11_CCG16_LAD16_EN_LU.csv

**tbx file dataset:** ByWqFWX5tx

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

### cty15cd-lsoa11cd - ons-mapping
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

#### ? issues with ons-mapping data
* originally count of LAD15CD-WD15CD: 8363, now is 9196, check the raw file in .csv
* originally count of LAD15CD-LSOACD: 32844, now is 34754, check the raw file in .csv, there are in total 34754 LSOA11CD code


## Intermediate Results of Process
The intermediate results while calculating the ratio which represents that for each demographic, the percentage of people registered in different GP from each LSOA, to the total population in each LSOA.

The second part of process is similar to what had been done with GP data for school's data. The calculation process generates the ratio that says for each demographic, how many pupils from one LSOA area registered in each schools to the total pupils living in this particular LSOA area.


### **pople-each-gp-calculator:**
This module generates that for each demographic, the number of people registered in each GP service from each LSOA.

  **local files:**
  * "gp-reg-patients-LSOA-FEMALE.csv",
  * "gp-reg-patients-LSOA-MALE.csv" 

  #### output json format
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

### **people-each-lsoa-calculator**
This module generates the total population in each LSOA area.

  **local files:** 
  * "gp-reg-patients-LSOA-FEMALE.csv"
  * "gp-reg-patients-LSOA-MALE.csv"
  
  ##### **output json format**
  ```json
    {
      "area_id":"E01012187",
      "gender":"female",
      "persons":300
    }
  ```

### **ratio-each-service**
This module requires both "pople-each-gp-calculator" and "pople-each-gp-calculator" in order to calculate the ratio implies the propotion of people registered in each GP from each LSOA area.
  **local files:**
  * gp-reg-patients-LSOA-FEMALE,"HJx0Heritg"
  * gp-reg-patients-LSOA-MALE, "SyXw0PXsFg"

  #### **output data schema**
  ```json
  {
    "area_id": {
      "type": ["string"]
    },
    "ageBand": {
      "type": ["string"]
    },
    "gender": {
      "type": ["string"]
    },
    "ratioType": {
      "type": ["string"]
    },
    "serviceId": {
      "type": ["string"]
    },
    "ratio": {
      "type": ["number"]
    },
    "serviceRatio": {
      "type": ["object"]
    }
  }
  ```

### **age-ratio-each-lsoa**
This module calculates the ratio which represents the proption of people in each age band registered in on GP.
  **resource Id on tdx**
  * "ryegnTW9Fg"
  **local file:**
  * gp-reg-patients-prac-sing-year-age.csv

  #### **ouput data schema**

  ```json
  {
    "area_id": {
      "type": ["string"]
    },
    "ageBand": {
      "type": ["string"]
    },
    "gender": {
      "type": ["string"]
    },
    "ratioType": {
      "type": ["string"]
    },
    "serviceId": {
      "type": ["string"]
    },
    "ratio": {
      "type": ["number"]
    },
    "serviceRatio": {
      "type": ["object"]
    }
  }
  ```

### **gp-ratio**
This is the module which reads the outcome from files "ratio-each-service" and "age-ratio-each-lsoa", and result in the final demographic ratio, multiply with age ratio and gender ratio.

  #### **input schema**
  ```json
  {
    "area_id": {
      "type": ["string"]
    },
    "ageBand": {
      "type": ["string"]
    },
    "gender": {
      "type": ["string"]
    },
    "ratioType": {
      "type": ["string"]
    },
    "serviceId": {
      "type": ["string"]
    },
    "ratio": {
      "type": ["number"]
    },
    "serviceRatio": {
      "type": ["object"]
    }
  }
  ```
  #### **output schema**
  ```json
  {
    "areaId": {
      "type": ["string"]
    },
    "ageBand": {
      "type": ["string"]
    },
    "gender": {
      "type": ["string"]
    },
    "ratio": {
      "type": ["object"]
    },
  }
  ```


### "ccg16cd-to-lsoa11cd"
This is the module which requires two other mapping datasets:
* one CCG code maps all the serviceIds inside
* one serviceId maps all LSOA code that registered patients from

  **dataset resource on tdx:**
  * "ccg16cd-to-serviceId": "SylOOZvVQl"
  * "serviceId-to-lsoa11cd": "SyeTVqStHl"

  #### **input/output schema**
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
    "mappingType": {
      "type": ["string"]
    }
  }
  ```
  
### Schools data process
* school importer
  lib/schools/line-parser.js  
* school ratio calculations
mapping-type: schools-ratio
  * for tsv raw file tr '\t' ',' < file.tsv > file.csv
  lib/schools/ratio-calculations.js (raw file "Autumn_Census_2013.csv")

### school yearGroup mapping to ageBand
yearGroup-ageBand-mapping.js
  ##tdx dataset source: ##S1gCLZJxNe

### school details mapping
  HJfA7HXtig - schools population
  H1lZ4tOYie - schools ratios

# schoolId mapping ro cty15cd and lsoa11cd accordingly

## schoolId-to-cty15cd code
  * mappingType: schoolId-to-cty15cd
  raw file "edubasedata.csv" and "LAD15_CTY15_EN_LU.csv"
  

## schoolId-to-lsoa11cd code
* mappingType: schoolId-to-lsoa11cd
raw file "edubasedata.csv" and "Autumn_Census_2013.csv"

### edubase data coordinates
  * schools-coordinates
  * rawFile edubasedata.csv


