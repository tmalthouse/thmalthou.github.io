---
layout: page
title: Workload Do-File
permalink: /predoc-work-samples/workload-duration/
---

```

// gstats transform (range...) comes from the gtools package,
// and offers functionality similar to the rangestats command
// I prefer the gtools syntax, and it's much faster

local dir `c(pwd)'
cd "~/Documents/Freiburg/ZEW/georgia/01_data"
use "Georgia_minimized.dta",clear

gen contract_begin = date(validity_begin , "YMDhms")
format contract_begin %d

gen contract_end = date(validity_end , "YMDhms")
format contract_end	%d

gen contract_burden = est_value / contract_duration if winnerid == firmid
replace contract_burden = 0 if missing(contract_burden)

gegen firm_cat = group(firmid)

gegen agency_cat = group(procurement_entity)

gen zero = 0

// What are we doing here?
// We want to sum up the total burden of all active contracts on a certain date
// To avoid a (costly) for loop, we do some rangestat trickery
// We first sum up all active contracts that started in the past
// and then subtract the contracts that finished in the past
// This second set must be a subset of the first, so we're left with those that started in
// the past and are still active.

// Sum up all contracts that begin on or before this contract's start date, grouping by firm
gstats transform (range sum . 0 contract_begin) workload0 = contract_burden , excludeself by(firmid)

// Then sum up all contracts that finished before this contract's start date, grouping by firm
// Unfortunately gstats doesn't allow variables in the range, so we resort to the slower
// rangestat
rangestat (sum) workload1 = contract_burden , excludeself by(firmid) i(contract_end zero contract_begin)

// Then the burden is just the contracts that started in the past, subtracting those that have already finished
gen firm_current_burden = workload0 - workload1
replace firm_current_burden = 0 if missing(firm_current_burden)

// Awful lot of zeros---log(1+x) avoids undefined values
gen l_firm_current_burden = ln(1 + firm_current_burden)

drop workload0 workload1

// Now we do the same thing on the agency level

// Sum up all contracts that begin on or before this contract's start date, grouping by agency
gstats transform (range sum . 0 contract_begin) workload0 = contract_burden , excludeself by(agency_cat)

// Then sum up all contracts that finished before this contract's start date, grouping by agency
rangestat (sum) workload1 = contract_burden , excludeself by(agency_cat) i(contract_end zero contract_begin)


gen agency_current_burden = workload0 - workload1
replace agency_current_burden = 0 if missing(agency_current_burden)

gen l_agency_current_burden = ln(1 + agency_current_burden)

drop workload0 workload1 zero

// And then prepare a stripped-down dataset to merge back into the original

keep ann_nr firmid firm_current_burden l_firm_current_burden agency_current_burden l_agency_current_burden
save "Georgia_backlog_duration.dta" , replace

capture restore , preserve
cd `dir'

```