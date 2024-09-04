use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::models::PackageConfig;

#[derive(Clone, Default)]
pub struct PackageLayerCache {
    inner: Arc<RwLock<HashMap<String, String>>>,
}

impl PackageLayerCache {
    pub fn key(packages: &PackageConfig) -> String {
        let mut pip = packages.pip.clone();
        let mut npm = packages.npm.clone();
        pip.sort();
        npm.sort();
        let raw = format!("pip:{:?}|npm:{:?}", pip, npm);
        let h = Sha256::digest(raw.as_bytes());
        hex::encode(h)
    }

    pub async fn note_resolved(&self, key: &str, note: &str) {
        let mut g = self.inner.write().await;
        g.insert(key.to_string(), note.to_string());
    }

    pub async fn get(&self, key: &str) -> Option<String> {
        self.inner.read().await.get(key).cloned()
    }
}
