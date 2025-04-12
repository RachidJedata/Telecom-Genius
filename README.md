# 🚀 telecomGenius: Advanced Telecommunications Simulation Platform

![Project Logo](public/logo.png)  
*A comprehensive simulation platform for modeling wireless channels and propagation effects.*

---

## 🌟 Features

### **Robust Simulation Environment**
- Supports **10+ channel models** for diverse wireless scenarios
- Detailed analysis of propagation effects with configurable parameters

### **Channel & Propagation Models**
#### **Core Channel Models**
- 📡 **Free Space Path Loss (FSPL)** - Basic propagation model
- 🌪️ **Rayleigh Fading** - Multipath fading in scatter-rich environments
- 📶 **Rician Channel** - LOS + multipath scenarios
- 🍃 **Nakagami Fading** - Flexible fading approximation

#### **Advanced Propagation Models**
- 🛰️ **Two-Ray Ground Model** - Direct + ground-reflected rays
- 🏙️ **Okumura-Hata** - Urban propagation modeling
- 📡 **COST 231** - Extended Okumura-Hata for higher frequencies
- 🌄 **Longley-Rice** - Long-distance irregular terrain modeling

#### **Specialized Models**
- 🌳 **Weissberger Model** - Vegetation attenuation effects
- ⚡ **OFDM Implementation** - Modern broadband communications
- 🌍 **ITU-R P.1411** - Multi-terrain/frequency recommendations

---

## 🛠️ Installation

### **Prerequisites**
- Python 3.7+ 🐍
- Node.js
- npm 9+

### **Next.js Setup**
```bash
npm install
npm run dev

### Python Simulation
**Navigate to the simulation folder:**
   ```bash
   cd simulation
   ```

pip install FastAPI, Query ,CORSMiddleware,numpy ,scipy.stats,
uvicorn uvicorn main:app --reload 