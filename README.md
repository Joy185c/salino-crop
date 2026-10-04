<div align="center">
  <img src="./frontend/public/logo.png" alt="SalinO-Crop Logo" width="150" height="150" />
  
  # 🌱 SalinO-Crop
  **Coastal Salinity Intelligence & Crop Advisory Platform**
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  
  <p align="center">
    A climate-resilience platform for coastal Bangladesh that forecasts root-zone soil salinity 30-90 days in advance and recommends suitable crops to coastal farmers via an AI-assisted Bengali voice advisory.
  </p>
  
  <sub>Built for the <b>Hack for Humanity 2026</b> by <b>DIU Hustle Brigade</b></sub>
</div>

---

## ✨ Features

- 🗺️ **Interactive Salinity Mapping** — Visualize high-resolution coastal soil salinity using MapLibre GL.
- 🔮 **Advanced Forecasting** — 30, 60, and 90-day predictive forecasts powered by Sentinel-2 Optical and Sentinel-1 SAR data, combined with local weather & tidal data.
- 🌾 **Smart Crop Matching** — Deterministic agronomic algorithms that match crop tolerance thresholds to localized forecasted salinity levels.
- 🗣️ **Bengali AI Voice Advisory** — Farmer-friendly, hyper-local voice guidance generated via Groq/Gemini and synthesized with Google Cloud TTS.
- 📡 **Ground Validation Pipeline** — In-built system for extension officers to submit ground-truth field measurements to continuously improve model accuracy.

---

## 🏗️ Project Architecture

| Directory | Description | Technologies |
| :--- | :--- | :--- |
| 🌐 `/frontend` | The User Interface | Next.js (App Router), React, Tailwind CSS, MapLibre GL, Recharts |
| ⚙️ `/backend` | Core API & ML Pipeline | FastAPI, Python, SQLAlchemy, PostGIS, Pandas, Scikit-learn |
| 📊 `/data` | Demonstration Data | Sample geo-data for coastal districts (Satkhira, Khulna, etc.) |
| 📄 `/docs` | Technical Documentation | Architecture diagrams, API specs, and Model Cards |
| 🛠️ `/scripts` | Utilities | Database seeding, migrations, and model testing scripts |

---

## 🚀 Getting Started

The easiest way to run the full stack locally is via **Docker Compose**.

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose installed.
- (Optional) Node.js & Python 3.10+ if running natively.

### 1. Environment Setup

Clone the repository and set up your environment variables:

```bash
# Backend ENV
cp backend/.env.example backend/.env

# Frontend ENV
cp frontend/.env.local.example frontend/.env.local
```

### 2. Launch the Application

```bash
docker-compose up --build
```
*This spins up the PostgreSQL (PostGIS) database, the FastAPI backend, and the Next.js frontend.*

### 3. Seed Demonstration Data
Once the database is up and running, open a new terminal and run:
```bash
docker-compose exec backend python /app/scripts/seed_db.py
```

### 🎯 Access the App
- **Web Platform:** [http://localhost:3000](http://localhost:3000)
- **API Documentation (Swagger UI):** [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

---

## 🎭 DEMO vs LIVE Mode

By default, the application runs in **DEMO MODE** (`NEXT_PUBLIC_DEMO_MODE="true"`).

- **DEMO Mode:** Uses pre-seeded geospatial data for plots and simulates Sentinel satellite indices to generate plausible baseline predictions. It **does not require** active API keys for Copernicus, weather integrations, or LLMs.
- **LIVE Mode:** Set `DEMO_MODE=false` in the `.env` files and provide valid API keys. The system will actively fetch real-time satellite telemetry, tide data, and trigger live AI generation.

---

## 🔬 Methodology & Scientific Pipeline

Our pipeline is built for transparency and accuracy:
1. **Data Ingestion:** Sentinel-2 multispectral info + Sentinel-1 SAR.
2. **Preprocessing:** Cloud masking & temporal composite generation.
3. **Salinity Mapping:** Baseline Random Forest models correlating surface reflectance with ground EC.
4. **Forecasting:** Physics-informed time-series models predicting root-zone variations.
5. **Crop Matching:** Threshold-based logic evaluating 30+ crop varieties.
6. **Advisory Generation:** NLP transformations into conversational Bengali.

---

## 🛤️ Roadmap

- [x] MVP Core Architecture & UI Prototype
- [x] Baseline RF Salinity Mapping
- [x] Groq/Gemini-powered Bengali Advisory Generation
- [ ] Train & deploy PyTorch PINN+LSTM forecast models
- [ ] Direct integration with live Copernicus Sentinel Hub
- [ ] Field-agent Authentication & Offline Sync
- [ ] SMS / IVR Gateway Integration for marginalized farmers

<br>

<div align="center">
  <p><b>SalinO-Crop</b> • Empowering Coastal Farmers • Protecting Food Security</p>
</div>
