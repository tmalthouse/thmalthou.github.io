---
layout: page
title: DiD Do-File
permalink: /predoc-work-samples/did-threelevel/
---


```
use "~/Documents/ZEW/italy/raw/data_referenceprices_matchedANAC_final.dta",clear

drop Post
gen Post = date_order >= td(01jan2016)

egen ID_hospital_cv = group(ID_hospital) , label

gen ClassH = substr(CND_DISPOSITIVO, 1, 1) == "H"

// drop if ClassH 

drop quarter
gen quarter = quarter(date_order) 

gen Centralized = 1 if centralized & value_contract > 40000
replace Centralized = 0 if missing(Centralized)

gen RefPriceXPost = RefPrice * Post
gen CentralizedXPost = Centralized * Post
gen RefPriceXCentralized = RefPrice * Centralized

gen RefPriceXCentralizedXPost = RefPrice * Centralized * Post

eststo clear

eststo: reg ln_price RefPrice Centralized Post RefPriceXPost CentralizedXPost RefPriceXCentralized RefPriceXCentralizedXPost
estadd local dev_fe "No"
estadd local hosp_fe "No"
estadd local qtr_fe "No"

eststo: reghdfe ln_price RefPrice Centralized Post RefPriceXPost CentralizedXPost RefPriceXCentralized RefPriceXCentralizedXPost , abs(ID_device ID_hospital_cv quarter)
estadd local dev_fe "Yes"
estadd local hosp_fe "Yes"
estadd local qtr_fe "Yes"


esttab using tex/out.tex , replace s(N dev_fe hosp_fe qtr_fe , label("N" "Device FE" "Hospital FE" "Quarter FE")) noconstant se

eststo clear

/* eststo: reg ln_price RefPrice Post RefPriceXPost
estadd local dev_fe "No"
estadd local hosp_fe "No"
estadd local qtr_fe "No"

eststo: reghdfe ln_price RefPrice Post RefPriceXPost , abs(ID_device ID_hospital_cv quarter)
estadd local dev_fe "Yes"
estadd local hosp_fe "Yes"
estadd local qtr_fe "Yes"


esttab using tex/out2.tex , replace s(N dev_fe hosp_fe qtr_fe , label("N" "Device FE" "Hospital FE" "Quarter FE")) noconstant se

 */
 ```