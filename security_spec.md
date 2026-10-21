# Security Specification: ATMOS Textile ERP

## 1. Data Invariants
- Each document ID must be a non-empty string under 128 characters matching `^[a-zA-Z0-9_\-]+$`.
- Parties, Trips, Payments, and Weigh records represent industrial operational data.
- Read operations are allowed for client operations.
- Updates and deletes require valid document structure and cannot inject malformed fields.
- Numerics must be positive numbers (pipeCount >= 0, beamCount >= 0, fare >= 0).

## 2. The Dirty Dozen Payloads (Targeting Exploits)
1. Injection of malicious 2MB string into `partyId`.
2. Setting negative values for `fare`, `amount`, or `pipeCount`.
3. Creating a trip with invalid `entryType` (not "Inward" or "Outward").
4. Creating a payment without an `owner` or `amount`.
5. Modifying immutable document IDs.
6. Spoofing internal system parameters.
7. Attempting to write unverified collections.
8. Writing empty string as `challanNo`.
9. Exceeding maximum field length limits.
10. Unbounded arrays injection into weigh items.
11. Missing required fields in trip records.
12. Attempting arbitrary root collection writes.
