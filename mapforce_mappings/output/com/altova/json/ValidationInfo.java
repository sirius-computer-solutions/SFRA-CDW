////////////////////////////////////////////////////////////////////////
//
// ValidationInfo.java
//
// This file was generated by MapForce MapForce 2021r2sp1.
//
// YOU SHOULD NOT MODIFY THIS FILE, BECAUSE IT WILL BE
// OVERWRITTEN WHEN YOU RE-RUN CODE GENERATION.
//
// Refer to the MapForce Documentation for further details.
// http://www.altova.com/mapforce
//
////////////////////////////////////////////////////////////////////////

package com.altova.json;

import java.util.*;

enum Validity {
	Valid,
	Invalid
}

public class ValidationInfo {
	private Validity _validity;
	private HashSet<String> _schemas = new HashSet<String>();

	public boolean IsValid() { return _validity == Validity.Valid; }

	public boolean IsA(String schema) {
		return _schemas.contains(schema);
	}
		
	public ValidationInfo(Validity validity) { _validity = validity; }

	public ValidationInfo(String schema) { _validity = Validity.Valid; _schemas.add(schema); }

	public void AddSchema(String schema) { _schemas.add(schema); }

	public void Merge(ValidationInfo other) {
		if (_validity == Validity.Invalid || other._validity == Validity.Invalid) {
			_validity = Validity.Invalid;
			_schemas.clear();
		} else {
			_schemas.addAll(other._schemas);
		}
	}
		
//	public Validity getValidity() { return _validity; }
}