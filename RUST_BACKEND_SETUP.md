# BetAman Rust Backend Setup Guide

This document provides complete setup instructions for the BetAman Rust backend service, Anchor smart contracts, and CLI tool.

## Architecture Overview

```
BetAman Full Stack:
├── Frontend: Next.js 16 (TypeScript/React)
├── Rust Backend: Axum HTTP Server (Image analysis, fraud detection)
├── Solana Smart Contracts: Anchor/Rust (Escrow + SBT minting)
└── Rust CLI: Development & testing tool
```

## Prerequisites

- Rust 1.75+ ([install](https://rustup.rs/))
- Cargo (installed with Rust)
- Node.js 18+ (for Anchor development)
- Solana CLI ([install](https://docs.solana.com/cli/install-solana-cli-tools))
- Anchor CLI ([install](https://www.anchor-lang.com/docs/installation))

## Part 1: Rust Backend Service

### Setup

```bash
# Create Rust backend project
cargo new rust-backend
cd rust-backend

# Update Cargo.toml with dependencies
```

### Cargo.toml

```toml
[package]
name = "betaman-backend"
version = "0.1.0"
edition = "2021"

[dependencies]
tokio = { version = "1.40", features = ["full"] }
axum = "0.7"
tower = "0.4"
tower-http = { version = "0.5", features = ["cors", "trace"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tracing = "0.1"
tracing-subscriber = "0.3"

# Image processing
image = "0.24"
img-hash = "0.2"
kamadak-exif = "0.5"
exifdata = "0.4"

# Database
sqlx = { version = "0.7", features = ["runtime-tokio-rustls", "sqlite", "json"] }
rusqlite = { version = "0.29", features = ["bundled"] }

# HTTP client for AI
reqwest = { version = "0.11", features = ["json"] }

# Utilities
uuid = { version = "1.0", features = ["v4", "serde"] }
anyhow = "1.0"
thiserror = "1.0"
```

### Main.rs Structure

```rust
// src/main.rs
mod routes;
mod db;
mod fraud_detection;
mod image_analysis;

use axum::{
    routing::{get, post},
    Router,
};
use tower_http::cors::CorsLayer;
use std::sync::Arc;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    // Initialize database
    let db = Arc::new(db::Database::new("./data/image_hashes.db").await?);

    // Build router
    let app = Router::new()
        // Health check
        .route("/health", get(routes::health))
        
        // Analysis endpoints
        .route("/api/analyze", post(routes::analyze_full))
        .route("/api/analyze/exif", post(routes::analyze_exif))
        .route("/api/analyze/screenshot", post(routes::detect_screenshot))
        .route("/api/analyze/fingerprint", post(routes::analyze_fingerprint))
        
        // Database
        .with_state(db)
        
        // CORS
        .layer(CorsLayer::permissive());

    // Start server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await?;
    tracing::info!("Server running on http://localhost:3001");
    axum::serve(listener, app).await?;

    Ok(())
}
```

### Key Modules

#### Image Analysis (src/image_analysis.rs)

```rust
pub async fn extract_exif(image_data: &[u8]) -> anyhow::Result<ExifData> {
    // Use kamadak-exif or exifdata crates
    let reader = std::io::Cursor::new(image_data);
    let exif = exif::Reader::new()
        .read_from_reader(&mut std::io::Cursor::new(image_data))?;
    
    let mut gps = None;
    for field in exif.fields() {
        if field.tag.to_u16() == 0x0002 { // GPSLatitude
            // Parse GPS coordinates
        }
    }
    
    Ok(ExifData { gps, /* ... */ })
}

pub async fn detect_screenshot(image_data: &[u8]) -> anyhow::Result<ScreenshotDetectionResult> {
    let img = image::load_from_memory(image_data)?;
    let aspect_ratio = img.width() as f32 / img.height() as f32;
    
    // Phone screenshot: typically 9:16, computer: 4:3 or 16:9
    let is_screenshot = aspect_ratio < 0.7; // Likely portrait smartphone screenshot
    
    Ok(ScreenshotDetectionResult {
        is_screenshot,
        confidence: 0.92,
        /* ... */
    })
}

pub async fn compute_perceptual_hash(image_data: &[u8]) -> anyhow::Result<String> {
    use img_hash::{ImageHash, HashType};
    
    let image = image::load_from_memory(image_data)?;
    let hash = ImageHash::hash(&image, 16, HashType::Gradient);
    
    Ok(format!("{:x}", hash.hash as u64))
}
```

#### Fraud Detection (src/fraud_detection.rs)

```rust
pub struct FraudAnalysis {
    pub risk_score: u8,
    pub checks: FraudChecks,
}

pub struct FraudChecks {
    pub reverse_image: CheckResult,
    pub location_verification: CheckResult,
    pub price_anomaly: CheckResult,
    pub urgency_language: CheckResult,
    pub description_match: CheckResult,
}

pub async fn analyze_listing(
    location: &str,
    price: u64,
    description: &str,
    images: Vec<Vec<u8>>,
) -> anyhow::Result<FraudAnalysis> {
    // 1. Reverse image check
    let reverse_pass = check_reverse_image(&images[0]).await?;
    
    // 2. Location verification
    let location_pass = verify_location(location, &images[0]).await?;
    
    // 3. Price anomaly
    let price_pass = check_price_anomaly(location, price).await?;
    
    // 4. Urgency language
    let urgency_pass = detect_urgency_language(description)?;
    
    // 5. Description match
    let description_pass = match_description_to_photos(description, &images).await?;
    
    // Calculate risk score (0-100)
    let risk_score = calculate_risk_score(&[
        reverse_pass, location_pass, price_pass, urgency_pass, description_pass
    ]);
    
    Ok(FraudAnalysis {
        risk_score,
        checks: FraudChecks {
            reverse_image: reverse_pass,
            location_verification: location_pass,
            price_anomaly: price_pass,
            urgency_language: urgency_pass,
            description_match: description_pass,
        }
    })
}
```

#### Database (src/db.rs)

```rust
pub struct Database {
    conn: rusqlite::Connection,
}

impl Database {
    pub async fn new(path: &str) -> anyhow::Result<Self> {
        let conn = rusqlite::Connection::open(path)?;
        
        // Create tables
        conn.execute(
            "CREATE TABLE IF NOT EXISTS image_hashes (
                id TEXT PRIMARY KEY,
                hash TEXT NOT NULL,
                similarity REAL,
                location TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;
        
        Ok(Database { conn })
    }
    
    pub fn find_similar_images(&self, hash: &str) -> anyhow::Result<Vec<SimilarImage>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, hash, similarity, location FROM image_hashes 
             WHERE similarity > 0.85 LIMIT 10"
        )?;
        
        let images = stmt.query_map([], |row| {
            Ok(SimilarImage {
                image_id: row.get(0)?,
                hash: row.get(1)?,
                similarity: row.get(2)?,
                location: row.get(3)?,
            })
        })?.collect::<Result<Vec<_>, _>>()?;
        
        Ok(images)
    }
}
```

#### Routes (src/routes.rs)

```rust
use axum::extract::Multipart;

pub async fn health() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "ok",
        "version": "1.0.0"
    }))
}

pub async fn analyze_full(
    axum::extract::State(db): axum::extract::State<Arc<Database>>,
    mut multipart: Multipart,
) -> Result<impl IntoResponse, String> {
    let mut location = String::new();
    let mut price = String::new();
    let mut description = String::new();
    let mut images = Vec::new();

    while let Some(field) = multipart.next_field().await
        .map_err(|e| e.to_string())? {
        match field.name().unwrap_or("") {
            "location" => location = field.text().await.map_err(|e| e.to_string())?,
            "price" => price = field.text().await.map_err(|e| e.to_string())?,
            "description" => description = field.text().await.map_err(|e| e.to_string())?,
            "images" => {
                let bytes = field.bytes().await.map_err(|e| e.to_string())?;
                images.push(bytes.to_vec());
            }
            _ => {}
        }
    }

    let price_u64 = price.parse::<u64>().map_err(|e| e.to_string())?;
    
    let analysis = fraud_detection::analyze_listing(
        &location,
        price_u64,
        &description,
        images,
    ).await.map_err(|e| e.to_string())?;

    Ok(Json(analysis))
}

pub async fn analyze_exif(
    axum::extract::State(_db): axum::extract::State<Arc<Database>>,
    mut multipart: Multipart,
) -> Result<impl IntoResponse, String> {
    // Extract and return EXIF data
    todo!()
}

pub async fn detect_screenshot(
    axum::extract::State(_db): axum::extract::State<Arc<Database>>,
    mut multipart: Multipart,
) -> Result<impl IntoResponse, String> {
    // Detect if image is screenshot
    todo!()
}

pub async fn analyze_fingerprint(
    axum::extract::State(db): axum::extract::State<Arc<Database>>,
    mut multipart: Multipart,
) -> Result<impl IntoResponse, String> {
    // Compute perceptual hash and find matches
    todo!()
}
```

### Build & Run

```bash
# Build
cargo build --release

# Run
RUST_LOG=info cargo run --release

# Server starts on http://localhost:3001
```

---

## Part 2: Solana Anchor Smart Contracts

### Setup

```bash
# Create Anchor project
anchor init betaman-escrow
cd betaman-escrow

# Build
anchor build

# Test
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

### Program Structure (programs/betaman_escrow/src/lib.rs)

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer};

declare_id!("BetA...");

#[program]
pub mod betaman_escrow {
    use super::*;

    pub fn create_escrow(
        ctx: Context<CreateEscrow>,
        listing_id: String,
        amount: u64,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        escrow.listing_id = listing_id;
        escrow.tenant = ctx.accounts.tenant.key();
        escrow.broker = ctx.accounts.broker.key();
        escrow.amount = amount;
        escrow.status = EscrowStatus::Pending;
        escrow.created_at = Clock::get()?.unix_timestamp;
        
        // Transfer tokens from tenant to escrow vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.tenant_token_account.to_account_info(),
                    to: ctx.accounts.escrow_vault.to_account_info(),
                    authority: ctx.accounts.tenant.to_account_info(),
                },
            ),
            amount,
        )?;

        emit!(EscrowCreated {
            listing_id: escrow.listing_id.clone(),
            tenant: escrow.tenant,
            broker: escrow.broker,
            amount: escrow.amount,
        });

        Ok(())
    }

    pub fn confirm_viewing(ctx: Context<ConfirmViewing>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(
            escrow.status == EscrowStatus::Pending,
            ErrorCode::InvalidStatus
        );
        
        escrow.status = EscrowStatus::Confirmed;
        escrow.confirmed_at = Some(Clock::get()?.unix_timestamp);

        // Release funds to broker
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_vault.to_account_info(),
                    to: ctx.accounts.broker_token_account.to_account_info(),
                    authority: ctx.accounts.escrow.to_account_info(),
                },
                &[&[
                    b"escrow",
                    escrow.listing_id.as_bytes(),
                    &[ctx.bumps.escrow],
                ]],
            ),
            escrow.amount,
        )?;

        emit!(ViewingConfirmed {
            listing_id: escrow.listing_id.clone(),
            confirmed_at: escrow.confirmed_at.unwrap(),
        });

        Ok(())
    }

    pub fn mint_sbt(ctx: Context<MintSBT>) -> Result<()> {
        // Requires escrow to be in Confirmed status
        let escrow = &ctx.accounts.escrow;
        require!(
            escrow.status == EscrowStatus::Confirmed,
            ErrorCode::InvalidStatus
        );

        // Use Metaplex Bubblegum to mint cNFT
        // Metadata includes: listing_id, location, date, broker_address
        
        emit!(SBTMinted {
            listing_id: escrow.listing_id.clone(),
            recipient: escrow.broker,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(listing_id: String)]
pub struct CreateEscrow<'info> {
    #[account(mut)]
    pub tenant: Signer<'info>,
    pub broker: SystemAccount<'info>,
    #[account(
        init,
        pda = [b"escrow", listing_id.as_bytes()],
        space = 8 + EscrowState::INIT_SPACE,
        bump,
        payer = tenant,
    )]
    pub escrow: Account<'info, EscrowState>,
    #[account(mut)]
    pub tenant_token_account: Account<'info, token::TokenAccount>,
    #[account(
        init,
        token::mint = mint,
        token::authority = escrow,
        payer = tenant,
    )]
    pub escrow_vault: Account<'info, token::TokenAccount>,
    pub mint: Account<'info, token::Mint>,
    pub token_program: Program<'info, token::Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct EscrowState {
    pub listing_id: String,
    pub tenant: Pubkey,
    pub broker: Pubkey,
    pub amount: u64,
    pub status: EscrowStatus,
    pub created_at: i64,
    pub confirmed_at: Option<i64>,
}

#[derive(Clone, Copy, PartialEq, Eq, AnchorSerialize, AnchorDeserialize)]
pub enum EscrowStatus {
    Pending,
    Confirmed,
    Released,
    Refunded,
}

#[event]
pub struct EscrowCreated {
    pub listing_id: String,
    pub tenant: Pubkey,
    pub broker: Pubkey,
    pub amount: u64,
}

#[event]
pub struct ViewingConfirmed {
    pub listing_id: String,
    pub confirmed_at: i64,
}

#[event]
pub struct SBTMinted {
    pub listing_id: String,
    pub recipient: Pubkey,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid escrow status")]
    InvalidStatus,
}
```

---

## Part 3: Rust CLI Tool

### Cargo.toml

```toml
[package]
name = "betaman-cli"
version = "0.1.0"
edition = "2021"

[[bin]]
name = "betaman-cli"
path = "src/main.rs"

[dependencies]
clap = { version = "4.4", features = ["derive"] }
tokio = { version = "1.40", features = ["full"] }
reqwest = { version = "0.11", features = ["json"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

### Main.rs

```rust
// src/main.rs
use clap::{Parser, Subcommand};
use std::path::PathBuf;

mod commands;

#[derive(Parser)]
#[command(name = "BetAman CLI")]
#[command(about = "Development tool for BetAman fraud detection system")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Analyze a single image for fraud detection
    Analyze {
        /// Path to image file
        #[arg(value_name = "FILE")]
        image: PathBuf,
        
        /// Property location
        #[arg(long)]
        location: String,
        
        /// Property price in ETB
        #[arg(long)]
        price: u64,
    },
    
    /// Batch analyze multiple images
    Batch {
        /// Directory containing images
        #[arg(value_name = "DIR")]
        directory: PathBuf,
        
        /// Output file for results
        #[arg(long)]
        output: PathBuf,
    },
    
    /// Test escrow smart contract
    TestEscrow {
        /// Deposit amount
        #[arg(long)]
        amount: u64,
        
        /// Timeout period
        #[arg(long)]
        timeout: String,
    },
    
    /// Generate demo listings for testing
    GenerateDemo {
        /// Number of listings to generate
        #[arg(long)]
        count: usize,
        
        /// Output file
        #[arg(long)]
        output: PathBuf,
    },
    
    /// Query reputation for wallet
    Reputation {
        /// Wallet address
        #[arg(long)]
        wallet: String,
        
        /// Use devnet
        #[arg(long)]
        devnet: bool,
    },
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    
    match cli.command {
        Commands::Analyze { image, location, price } => {
            commands::analyze::run(image, location, price).await?;
        }
        Commands::Batch { directory, output } => {
            commands::batch::run(directory, output).await?;
        }
        Commands::TestEscrow { amount, timeout } => {
            commands::test_escrow::run(amount, timeout).await?;
        }
        Commands::GenerateDemo { count, output } => {
            commands::generate_demo::run(count, output).await?;
        }
        Commands::Reputation { wallet, devnet } => {
            commands::reputation::run(wallet, devnet).await?;
        }
    }
    
    Ok(())
}
```

### Build & Run

```bash
cargo build --release
./target/release/betaman-cli analyze ./test.jpg --location Bole --price 15000
```

---

## Integration with Next.js Frontend

### Environment Variables (.env.local)

```
# Rust Backend
RUST_BACKEND_URL=http://localhost:3001

# Solana RPC (devnet)
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com

# Solana Program ID (after deployment)
NEXT_PUBLIC_PROGRAM_ID=BetA...
```

### Next.js API Route (app/api/analyze/route.ts)

```typescript
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  
  try {
    const response = await fetch(
      `${process.env.RUST_BACKEND_URL}/api/analyze`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const analysis = await response.json();
    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
```

---

## Deployment

### Local Development

```bash
# Terminal 1: Rust Backend
cd rust-backend
cargo run --release

# Terminal 2: Next.js Frontend
cd ..
pnpm dev

# Terminal 3: Solana Local Validator (optional)
solana-test-validator
```

### Production Deployment

1. **Rust Backend**: Deploy to AWS EC2, Railway, or Heroku
2. **Smart Contracts**: Deploy to Solana mainnet via Anchor
3. **Next.js Frontend**: Deploy to Vercel

---

## Testing

```bash
# Backend tests
cd rust-backend
cargo test

# Contract tests
cd ../solana
anchor test

# Frontend tests
cd ..
pnpm test
```

---

## Troubleshooting

- **EXIF parsing fails**: Ensure image has valid EXIF metadata
- **Solana RPC errors**: Check devnet endpoint availability
- **Image hash mismatches**: Ensure consistent hashing algorithm
- **Smart contract deployment**: Verify sufficient SOL balance on devnet wallet

---

For more information, see the complete implementation guide in the plan at `/v0_plans/fresh-strategy.md`.
