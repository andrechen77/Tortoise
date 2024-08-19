use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn add_one(x: i32) -> i32 {
	x + 1
}

#[wasm_bindgen]
pub fn return_true() -> bool {
	true
}
