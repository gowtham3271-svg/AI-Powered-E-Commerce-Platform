import os
import sys
import json

# Ensure backend root is on python path
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import text
from app.database import engine, Base, SessionLocal, init_db_extensions
from app.models import (
    User, Category, Product, ProductReview, Cart, CartItem,
    Order, OrderItem, Document, DocumentChunk, ChatSession, ChatMessage, ProductBookmark
)
from app.core.security import get_password_hash
from app.services.document_service import DocumentService

def seed_database():
    print("Initializing database extensions and tables...")
    init_db_extensions()
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. SEED USERS
        print("Seeding Users...")
        admin = db.query(User).filter(User.email == "admin@buysmart.com").first()
        if not admin:
            admin = User(
                name="Store Administrator",
                email="admin@buysmart.com",
                hashed_password=get_password_hash("admin123"),
                role="admin"
            )
            db.add(admin)
            db.flush()
            db.add(Cart(user_id=admin.id))

        customer1 = db.query(User).filter(User.email == "john@example.com").first()
        if not customer1:
            customer1 = User(
                name="John Doe",
                email="john@example.com",
                hashed_password=get_password_hash("customer123"),
                role="customer"
            )
            db.add(customer1)
            db.flush()
            db.add(Cart(user_id=customer1.id))

        customer2 = db.query(User).filter(User.email == "priya@example.com").first()
        if not customer2:
            customer2 = User(
                name="Priya Sharma",
                email="priya@example.com",
                hashed_password=get_password_hash("customer123"),
                role="customer"
            )
            db.add(customer2)
            db.flush()
            db.add(Cart(user_id=customer2.id))

        customer3 = db.query(User).filter(User.email == "ananya@example.com").first()
        if not customer3:
            customer3 = User(
                name="Ananya Verma",
                email="ananya@example.com",
                hashed_password=get_password_hash("customer123"),
                role="customer"
            )
            db.add(customer3)
            db.flush()
            db.add(Cart(user_id=customer3.id))

        customer4 = db.query(User).filter(User.email == "rahul@example.com").first()
        if not customer4:
            customer4 = User(
                name="Rahul Nair",
                email="rahul@example.com",
                hashed_password=get_password_hash("customer123"),
                role="customer"
            )
            db.add(customer4)
            db.flush()
            db.add(Cart(user_id=customer4.id))

        db.commit()

        # 2. SEED CATEGORIES
        print("Seeding Categories...")
        categories_data = [
            {"name": "Smartphones", "description": "Next-gen flagship, mid-range and budget smartphones with AI capabilities."},
            {"name": "Laptops", "description": "High performance computing, ultrabooks, coding setups, and gaming machines."},
            {"name": "Headphones", "description": "Noise-cancelling wireless headphones, audiophile monitors, and TWS earbuds."},
            {"name": "Smartwatches", "description": "Advanced health tracking, fitness bands, and connected smartwatches."},
            {"name": "Accessories", "description": "Fast GaN chargers, ergonomic mice, SSD storage, and connectivity hubs."}
        ]
        
        category_map = {}
        for c in categories_data:
            cat = db.query(Category).filter(Category.name == c["name"]).first()
            if not cat:
                cat = Category(name=c["name"], description=c["description"])
                db.add(cat)
                db.flush()
            category_map[c["name"]] = cat.id
        db.commit()

        # 3. SEED PRODUCTS (32 High-Quality Items)
        print("Seeding Products...")
        products_data = [
            # --- LAPTOPS ---
            {
                "category": "Laptops",
                "name": "Acer Swift Go 14 OLED",
                "brand": "Acer",
                "price": 57999.00,
                "stock": 14,
                "description": "Thin and light powerhouse featuring a 2.8K OLED 90Hz display, Intel Core i5 13th Gen, ideal for programming, students, and content creation.",
                "image_url": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Processor": "Intel Core i5-13500H (12 Cores)",
                    "RAM": "16GB LPDDR5",
                    "Storage": "512GB NVMe Gen4 SSD",
                    "Display": "14-inch 2.8K (2880x1800) OLED 90Hz",
                    "Battery": "65Wh (Up to 10 hours)",
                    "Weight": "1.25 kg",
                    "OS": "Windows 11 Home",
                    "Warranty": "1 Year Onsite"
                }
            },
            {
                "category": "Laptops",
                "name": "ASUS TUF Gaming F15",
                "brand": "ASUS",
                "price": 58990.00,
                "stock": 8,
                "description": "Military-grade durability gaming laptop with NVIDIA GeForce RTX 3050, 144Hz display, and dual fans. Excellent for machine learning and casual gaming under 60k.",
                "image_url": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Processor": "Intel Core i5-11400H (6 Cores, 12 Threads)",
                    "GPU": "NVIDIA GeForce RTX 3050 (4GB GDDR6)",
                    "RAM": "16GB DDR4 (Expandable to 32GB)",
                    "Storage": "512GB PCIe 3.0 SSD",
                    "Display": "15.6-inch FHD 144Hz IPS",
                    "Battery": "48Wh Fast Charging (50% in 30 mins)",
                    "Weight": "2.30 kg",
                    "Warranty": "1 Year Brand Warranty"
                }
            },
            {
                "category": "Laptops",
                "name": "Lenovo IdeaPad Slim 3 15",
                "brand": "Lenovo",
                "price": 49990.00,
                "stock": 20,
                "description": "Everyday productivity laptop powered by AMD Ryzen 7 5700U with 8 cores, perfect for full-stack web development and college coursework.",
                "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Processor": "AMD Ryzen 7 5700U (8 Cores, 16 Threads)",
                    "RAM": "16GB DDR4 3200MHz",
                    "Storage": "512GB M.2 NVMe SSD",
                    "Display": "15.6-inch Full HD Anti-Glare IPS",
                    "Battery": "45Wh Rapid Charge",
                    "Weight": "1.65 kg",
                    "Warranty": "2 Year Premium Care"
                }
            },
            {
                "category": "Laptops",
                "name": "Apple MacBook Air M2",
                "brand": "Apple",
                "price": 94900.00,
                "stock": 12,
                "description": "Incredibly thin laptop with striking Liquid Retina display, silent fanless design, Apple M2 chip, and all-day 18-hour battery life for software engineers.",
                "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Processor": "Apple M2 (8-core CPU, 8-core GPU)",
                    "RAM": "8GB Unified Memory",
                    "Storage": "256GB High-Speed SSD",
                    "Display": "13.6-inch Liquid Retina with True Tone",
                    "Battery": "Up to 18 hours",
                    "Weight": "1.24 kg",
                    "Warranty": "1 Year Apple Care"
                }
            },
            {
                "category": "Laptops",
                "name": "ASUS ROG Zephyrus G14",
                "brand": "ASUS",
                "price": 139990.00,
                "stock": 5,
                "description": "Ultraportable gaming beast with AMD Ryzen 9, NVIDIA RTX 4060, ROG Nebula 165Hz HDR Display, and CNC aluminum chassis.",
                "image_url": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Processor": "AMD Ryzen 9 7940HS",
                    "GPU": "NVIDIA GeForce RTX 4060 8GB",
                    "RAM": "16GB DDR5 4800MHz",
                    "Storage": "1TB PCIe 4.0 NVMe SSD",
                    "Display": "14-inch QHD+ 165Hz 100% DCI-P3",
                    "Weight": "1.65 kg",
                    "Warranty": "1 Year Onsite + Accidental Damage Protection"
                }
            },
            {
                "category": "Laptops",
                "name": "Dell Inspiron 15 3520",
                "brand": "Dell",
                "price": 38990.00,
                "stock": 18,
                "description": "Affordable budget laptop for students and office tasks, featuring 120Hz smooth scrolling display and reliable Intel Core i3 12th Gen.",
                "image_url": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Processor": "Intel Core i3-1215U (6 Cores)",
                    "RAM": "8GB DDR4",
                    "Storage": "512GB SSD",
                    "Display": "15.6-inch FHD 120Hz",
                    "Battery": "41Wh",
                    "Weight": "1.68 kg",
                    "Warranty": "1 Year Dell Hardware Warranty"
                }
            },

            # --- SMARTPHONES ---
            {
                "category": "Smartphones",
                "name": "OnePlus Nord CE 4 5G",
                "brand": "OnePlus",
                "price": 24999.00,
                "stock": 25,
                "description": "Best camera and performance phone under ₹25,000. Features Sony LYT-600 50MP OIS camera, 100W SUPERVOOC charging, and Snapdragon 7 Gen 3.",
                "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Processor": "Qualcomm Snapdragon 7 Gen 3",
                    "RAM": "8GB LPDDR4X",
                    "Storage": "128GB UFS 3.1",
                    "Rear Camera": "50MP Sony LYT-600 OIS + 8MP Ultra-wide",
                    "Front Camera": "16MP",
                    "Battery": "5500mAh with 100W Fast Charging",
                    "Display": "6.7-inch AMOLED 120Hz HDR10+",
                    "Warranty": "1 Year Manufacturer Warranty"
                }
            },
            {
                "category": "Smartphones",
                "name": "Redmi Note 13 Pro 5G",
                "brand": "Xiaomi",
                "price": 23999.00,
                "stock": 19,
                "description": "200MP ultra-clear camera with OIS, 1.5K AMOLED 120Hz curved display, Snapdragon 7s Gen 2, and 67W turbo charging.",
                "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Processor": "Snapdragon 7s Gen 2",
                    "RAM": "8GB",
                    "Storage": "128GB",
                    "Rear Camera": "200MP OIS + 8MP + 2MP",
                    "Battery": "5100mAh with 67W Charger In Box",
                    "Display": "6.67-inch 1.5K AMOLED 120Hz",
                    "Warranty": "1 Year Brand Warranty"
                }
            },
            {
                "category": "Smartphones",
                "name": "Samsung Galaxy S24 5G",
                "brand": "Samsung",
                "price": 74999.00,
                "stock": 11,
                "description": "Galaxy AI flagship smartphone with Live Translate, Circle to Search, pro-grade 50MP triple cameras, and Armor Aluminum frame.",
                "image_url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Processor": "Exynos 2400 Deca-Core",
                    "RAM": "8GB",
                    "Storage": "256GB",
                    "Rear Camera": "50MP OIS + 12MP Ultra-wide + 10MP 3x Telephoto",
                    "Battery": "4000mAh with 25W Fast Charging",
                    "Display": "6.2-inch Dynamic AMOLED 2X 120Hz LTPO",
                    "Warranty": "1 Year Brand Warranty"
                }
            },
            {
                "category": "Smartphones",
                "name": "Apple iPhone 15",
                "brand": "Apple",
                "price": 69999.00,
                "stock": 15,
                "description": "Dynamic Island, 48MP main camera with 2x Telephoto, USB-C connector, durable color-infused back glass, and A16 Bionic chip.",
                "image_url": "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Processor": "A16 Bionic chip (6-core CPU)",
                    "RAM": "6GB",
                    "Storage": "128GB",
                    "Rear Camera": "48MP Main + 12MP Ultra-wide",
                    "Front Camera": "12MP TrueDepth",
                    "Display": "6.1-inch Super Retina XDR OLED",
                    "Charging": "USB-C, MagSafe Wireless Charging",
                    "Warranty": "1 Year Apple Warranty"
                }
            },
            {
                "category": "Smartphones",
                "name": "Google Pixel 8a",
                "brand": "Google",
                "price": 49999.00,
                "stock": 10,
                "description": "Google AI photography phone powered by Google Tensor G3, Best Take, Magic Audio Eraser, and 7 years of OS updates.",
                "image_url": "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Processor": "Google Tensor G3 + Titan M2",
                    "RAM": "8GB LPDDR5x",
                    "Storage": "128GB",
                    "Rear Camera": "64MP Quad PD + 13MP Ultra-wide",
                    "Battery": "4492mAh (24+ hour battery life)",
                    "Display": "6.1-inch Actua OLED 120Hz",
                    "Warranty": "1 Year Google Warranty"
                }
            },
            {
                "category": "Smartphones",
                "name": "realme Narzo 70 Pro 5G",
                "brand": "realme",
                "price": 18999.00,
                "stock": 22,
                "description": "Segment leading Sony IMX890 OIS camera under ₹20k, 67W fast charging, Air Gestures, and 120Hz Horizon OLED screen.",
                "image_url": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Processor": "MediaTek Dimensity 7050 5G",
                    "RAM": "8GB",
                    "Storage": "128GB",
                    "Rear Camera": "50MP Sony IMX890 OIS + 8MP",
                    "Battery": "5000mAh with 67W SUPERVOOC",
                    "Display": "6.67-inch AMOLED 120Hz",
                    "Warranty": "1 Year Warranty"
                }
            },

            # --- HEADPHONES & AUDIO ---
            {
                "category": "Headphones",
                "name": "Sony WH-1000XM5 Wireless ANC",
                "brand": "Sony",
                "price": 28990.00,
                "stock": 16,
                "description": "Industry-leading noise canceling headphones with dual processors, 8 microphones, LDAC Hi-Res Audio, and 30-hour battery life.",
                "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Driver": "30mm precision-engineered carbon fiber",
                    "Noise Cancellation": "Dual Processors V1 + QN1 (8 Microphones)",
                    "Battery": "30 Hours (3 min charge = 3 hours playback)",
                    "Connectivity": "Bluetooth 5.2, Multipoint, 3.5mm Aux",
                    "Weight": "250 grams",
                    "Warranty": "1 Year Sony India Warranty"
                }
            },
            {
                "category": "Headphones",
                "name": "Bose QuietComfort 45",
                "brand": "Bose",
                "price": 24900.00,
                "stock": 12,
                "description": "Iconic comfort, TriPort acoustic architecture, Quiet and Aware modes, and deep balanced sound.",
                "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Noise Cancellation": "Active Noise Cancelling (Quiet/Aware Mode)",
                    "Battery": "22 Hours per charge",
                    "Weight": "240 grams",
                    "Charging": "USB-C Fast Charging",
                    "Warranty": "1 Year Official Bose Warranty"
                }
            },
            {
                "category": "Headphones",
                "name": "Apple AirPods Pro (2nd Gen)",
                "brand": "Apple",
                "price": 22990.00,
                "stock": 20,
                "description": "Up to 2x more Active Noise Cancellation, Adaptive Audio, Transparency mode, Personalized Spatial Audio, and USB-C MagSafe case.",
                "image_url": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Chip": "Apple H2 headphone chip",
                    "Noise Cancellation": "Pro-level Active Noise Cancellation",
                    "Battery": "6 hours on single charge, 30 hours with case",
                    "Water Resistance": "IP54 dust, sweat, and water resistant",
                    "Warranty": "1 Year Apple Warranty"
                }
            },
            {
                "category": "Headphones",
                "name": "boAt Rockerz 550 Wireless",
                "brand": "boAt",
                "price": 1799.00,
                "stock": 45,
                "description": "Super bass over-ear wireless headphones with 50mm dynamic drivers, 20 hours battery life, and ergonomic plush ear cushions.",
                "image_url": "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Driver": "50mm Dynamic Audio Drivers",
                    "Battery": "20 Hours continuous playback",
                    "Connectivity": "Bluetooth 5.0 and AUX mode",
                    "Weight": "245 grams",
                    "Warranty": "1 Year boAt Warranty"
                }
            },
            {
                "category": "Headphones",
                "name": "Sennheiser HD 560S Audiophile",
                "brand": "Sennheiser",
                "price": 16990.00,
                "stock": 7,
                "description": "Open-back reference headphones designed for sound engineers, critical listening, and pristine spatial gaming acoustics.",
                "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Design": "Open-back Over-Ear",
                    "Frequency Response": "6 Hz to 38 kHz",
                    "Impedance": "120 Ohms",
                    "Cable": "3m detachable cable with 6.3mm plug + 3.5mm adapter",
                    "Warranty": "2 Year International Warranty"
                }
            },

            # --- SMARTWATCHES ---
            {
                "category": "Smartwatches",
                "name": "Apple Watch Series 9",
                "brand": "Apple",
                "price": 41900.00,
                "stock": 9,
                "description": "Powerful S9 SiP chip, Double Tap gesture control, precision finding for iPhone, brighter 2000 nit display, ECG and blood oxygen apps.",
                "image_url": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Display": "Always-On Retina OLED (up to 2000 nits)",
                    "Sensors": "ECG, Blood Oxygen, Temperature sensing, Fall Detection",
                    "Battery": "18 hours regular, 36 hours low power mode",
                    "Water Resistance": "50m Water resistant (Swimproof)",
                    "Warranty": "1 Year Apple Warranty"
                }
            },
            {
                "category": "Smartwatches",
                "name": "Samsung Galaxy Watch 6",
                "brand": "Samsung",
                "price": 26999.00,
                "stock": 14,
                "description": "Personalized heart rate zones, advanced sleep coaching, body composition analysis (BIA), and Wear OS with Google Assistant.",
                "image_url": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Display": "1.3-inch Super AMOLED Sapphire Crystal",
                    "Sensors": "BioActive Sensor (HR, ECG, BIA), Skin Temp",
                    "Battery": "300mAh with WPC wireless fast charging",
                    "OS": "Wear OS Powered by Samsung",
                    "Warranty": "1 Year Samsung Warranty"
                }
            },
            {
                "category": "Smartwatches",
                "name": "Amazfit GTR 4",
                "brand": "Amazfit",
                "price": 16999.00,
                "stock": 18,
                "description": "Dual-band circularly-polarized GPS antenna, 150+ sports modes, 14-day battery life, and ultra-large 1.43-inch HD AMOLED display.",
                "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Battery": "14 Days standard usage",
                    "GPS": "Dual-band 6 Satellite Positioning Systems",
                    "Display": "1.43-inch AMOLED Anti-glare glass",
                    "Health": "BioTracker 4.0 PPG biometric sensor",
                    "Warranty": "1 Year Brand Warranty"
                }
            },
            {
                "category": "Smartwatches",
                "name": "Noise ColorFit Pro 5",
                "brand": "Noise",
                "price": 3499.00,
                "stock": 35,
                "description": "Bluetooth calling smartwatch with functional crown, 1.85-inch AMOLED display, rapid emergency SOS, and 100+ sports modes.",
                "image_url": "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Display": "1.85-inch AMOLED 60Hz",
                    "Calling": "Tru Sync Bluetooth Calling",
                    "Battery": "Up to 7 days",
                    "Water Resistance": "IP68 water resistant",
                    "Warranty": "1 Year Noise Warranty"
                }
            },

            # --- ACCESSORIES ---
            {
                "category": "Accessories",
                "name": "Anker 735 GaNPrime 65W Charger",
                "brand": "Anker",
                "price": 4499.00,
                "stock": 30,
                "description": "Compact 3-port high-speed GaN fast charger. Can charge a MacBook Air, iPhone 15, and AirPods simultaneously.",
                "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Total Output": "65W Max PowerIQ 4.0",
                    "Ports": "2x USB-C + 1x USB-A",
                    "Protection": "ActiveShield 2.0 dynamic temperature sensor",
                    "Warranty": "24 Months Brand Warranty"
                }
            },
            {
                "category": "Accessories",
                "name": "Logitech MX Master 3S Wireless Mouse",
                "brand": "Logitech",
                "price": 8995.00,
                "stock": 15,
                "description": "The ultimate performance mouse for programmers and designers. 8K DPI any-surface tracking, quiet clicks, and MagSpeed electromagnetic scroll.",
                "image_url": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Sensor": "Darkfield 8000 DPI high precision",
                    "Scroll Wheel": "MagSpeed 1000 lines per second",
                    "Battery": "70 days on full charge (USB-C)",
                    "Connectivity": "Bluetooth LE + Logi Bolt USB Receiver",
                    "Warranty": "1 Year Limited Hardware Warranty"
                }
            },
            {
                "category": "Accessories",
                "name": "SanDisk Extreme 1TB Portable SSD",
                "brand": "SanDisk",
                "price": 8499.00,
                "stock": 25,
                "description": "Rugged external solid state drive with up to 1050MB/s read speeds, IP55 water and dust resistance, and 2-meter drop protection.",
                "image_url": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Capacity": "1TB NVMe Solid State Storage",
                    "Speed": "Up to 1050MB/s Read, 1000MB/s Write",
                    "Interface": "USB 3.2 Gen 2 Type-C",
                    "Durability": "IP55 rating, carabiner loop",
                    "Warranty": "5 Year Limited Warranty"
                }
            },
            {
                "category": "Accessories",
                "name": "Belkin 7-in-1 Multiport USB-C Hub",
                "brand": "Belkin",
                "price": 4999.00,
                "stock": 20,
                "description": "Turn 1 USB-C port into 4K HDMI, 2x USB-A 3.0, SD card reader, MicroSD reader, 3.5mm audio, and 100W USB-C Power Delivery pass-through.",
                "image_url": "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Video Output": "4K HDMI @ 60Hz",
                    "Power Delivery": "Up to 100W Pass-through charging",
                    "Data Transfer": "5 Gbps bandwidth",
                    "Warranty": "2 Year Warranty"
                }
            },
            {
                "category": "Laptops",
                "name": "HP Victus 15 Gaming Laptop",
                "brand": "HP",
                "price": 59490.00,
                "stock": 9,
                "description": "Balanced performance laptop with AMD Ryzen 5 5600H, NVIDIA RTX 3050 4GB, 16GB RAM, and 144Hz FHD display for coding, ML, and gaming.",
                "image_url": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Processor": "AMD Ryzen 5 5600H",
                    "GPU": "NVIDIA GeForce RTX 3050 4GB",
                    "RAM": "16GB DDR4",
                    "Storage": "512GB NVMe SSD",
                    "Display": "15.6-inch FHD 144Hz IPS",
                    "Warranty": "1 Year HP Onsite"
                }
            },
            {
                "category": "Smartphones",
                "name": "Motorola Edge 50 Fusion 5G",
                "brand": "Motorola",
                "price": 22999.00,
                "stock": 17,
                "description": "Ultra-sleek IP68 waterproof phone with Sony LYTIA 700C 50MP OIS camera, 144Hz pOLED curved display, and 68W TurboPower charging.",
                "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Processor": "Snapdragon 7s Gen 2",
                    "RAM": "8GB",
                    "Storage": "128GB",
                    "Rear Camera": "50MP Sony LYT-700C OIS + 13MP Ultra-wide",
                    "Battery": "5000mAh with 68W Fast Charging",
                    "Display": "6.7-inch 144Hz pOLED",
                    "Warranty": "1 Year Brand Warranty"
                }
            },
            {
                "category": "Smartphones",
                "name": "Samsung Galaxy M35 5G",
                "brand": "Samsung",
                "price": 19499.00,
                "stock": 28,
                "description": "Massive 6000mAh monster battery phone with 120Hz Super AMOLED display, Gorilla Glass Victus+, and 50MP No-Shake OIS camera.",
                "image_url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Processor": "Exynos 1380 5nm",
                    "RAM": "8GB",
                    "Storage": "128GB",
                    "Rear Camera": "50MP OIS + 8MP + 2MP",
                    "Battery": "6000mAh with 25W Fast Charging",
                    "Display": "6.6-inch Super AMOLED 120Hz",
                    "Warranty": "1 Year Samsung Warranty"
                }
            },
            {
                "category": "Headphones",
                "name": "HyperX Cloud III Gaming Headset",
                "brand": "HyperX",
                "price": 7990.00,
                "stock": 14,
                "description": "Pro-grade wired gaming headset featuring angled 53mm drivers, DTS Headphone:X Spatial Audio, and ultra-clear noise-cancelling mic.",
                "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Driver": "53mm Angled Neodymium",
                    "Audio": "DTS Headphone:X Spatial Audio",
                    "Microphone": "Detachable 10mm noise-cancelling with LED mute",
                    "Compatibility": "PC, PS5, Xbox, Switch, Mobile (USB-C/USB-A/3.5mm)",
                    "Warranty": "2 Year HyperX Warranty"
                }
            },
            {
                "category": "Smartwatches",
                "name": "Garmin Forerunner 165",
                "brand": "Garmin",
                "price": 27490.00,
                "stock": 6,
                "description": "Dedicated AMOLED GPS running smartwatch with adaptive training plans, morning health report, wrist-based running power, and 11-day battery.",
                "image_url": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Display": "1.2-inch AMOLED Touchscreen + Buttons",
                    "Battery": "Up to 11 Days Smartwatch Mode",
                    "GPS": "Multi-GNSS GPS/GLONASS/Galileo",
                    "Water Resistance": "5 ATM (50 meters)",
                    "Warranty": "2 Year Garmin India Warranty"
                }
            },
            {
                "category": "Accessories",
                "name": "Keychron K2 V2 Mechanical Keyboard",
                "brand": "Keychron",
                "price": 7499.00,
                "stock": 11,
                "description": "75% compact wireless Bluetooth/USB-C mechanical keyboard for Mac and Windows programmers with Gateron G Pro Brown tactile switches.",
                "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
                "specs": {
                    "Layout": "75% (84 Keys)",
                    "Switches": "Gateron G Pro Brown Tactile",
                    "Connectivity": "Bluetooth 5.1 (3 devices) + USB-C Wired",
                    "Battery": "4000mAh (Up to 240 hours)",
                    "Warranty": "1 Year Keychron Warranty"
                }
            }
        ]

        created_products = []
        for p_data in products_data:
            existing = db.query(Product).filter(Product.name == p_data["name"]).first()
            if not existing:
                prod = Product(
                    category_id=category_map[p_data["category"]],
                    name=p_data["name"],
                    brand=p_data["brand"],
                    price=p_data["price"],
                    stock_quantity=p_data["stock"],
                    description=p_data["description"],
                    image_url=p_data["image_url"],
                    specifications=json.dumps(p_data["specs"])
                )
                db.add(prod)
                db.flush()
                created_products.append(prod)
            else:
                created_products.append(existing)
        db.commit()

        # 4. SEED SAMPLE REVIEWS
        print("Seeding Product Reviews...")
        sample_reviews = [
            (created_products[0].id, customer1.id, 5, "Remarkable battery life and the OLED screen is stunning for coding in dark mode!"),
            (created_products[0].id, customer2.id, 4, "Very fast compilation times in Python and Rust. Gets slightly warm under intense benchmarks."),
            (created_products[1].id, customer1.id, 5, "Best gaming and ML laptop for ₹58k. RTX 3050 handles PyTorch training and Valorant at 140+ FPS."),
            (created_products[6].id, customer2.id, 5, "The 50MP Sony camera takes breathtaking night photos. 100W charging charges the phone from 0 to 100% in 28 mins!"),
            (created_products[12].id, customer1.id, 5, "ANC is mindblowing. Completely cuts out ceiling fans, train noise, and loud chatter. Worth every rupee."),
            (created_products[2].id, customer3.id, 5, "Ryzen 7 handles Docker and IntelliJ smoothly while staying super quiet."),
            (created_products[3].id, customer3.id, 5, "Silent fanless build and 18-hour battery makes travel coding effortless."),
            (created_products[9].id, customer3.id, 4, "Crisp Super Retina XDR display and USB-C convenience, though 60Hz takes getting used to."),
            (created_products[14].id, customer2.id, 5, "Seamless switching between MacBook and iPhone with awesome transparency mode."),
            (created_products[18].id, customer3.id, 4, "Accurate sleep coaching and body composition sensor; battery lasts around 2 days."),
            (created_products[22].id, customer1.id, 5, "MagSpeed scroll wheel and silent clicks are unmatched for long programming sessions."),
        ]
        for prod_id, u_id, rating, txt in sample_reviews:
            existing_rev = db.query(ProductReview).filter(
                ProductReview.product_id == prod_id,
                ProductReview.user_id == u_id
            ).first()
            if not existing_rev:
                db.add(ProductReview(product_id=prod_id, user_id=u_id, rating=rating, review_text=txt))
        db.commit()

        # 5. SEED KNOWLEDGE DOCUMENTS FOR RAG (Policies, FAQs, Warranties)
        print("Seeding Knowledge Documents and Generating Vector Embeddings...")
        knowledge_docs = [
            {
                "title": "BuySmart Shipping & Delivery Policy",
                "type": "policy",
                "source": "store_policies/shipping.md",
                "content": """# BuySmart Shipping & Delivery Policy
1. Order Processing: All orders are dispatched from our regional warehouses within 24 hours of successful payment confirmation.
2. Delivery Timeframes:
   - Metro Cities (Mumbai, Delhi-NCR, Bengaluru, Chennai, Hyderabad, Kolkata): 24 to 48 hours.
   - Non-Metro & Tier-2/Tier-3 Cities: 3 to 5 business days.
   - Remote regions: 5 to 7 business days.
3. Shipping Charges:
   - Free Standard Shipping is provided on all orders above ₹999.
   - Express Next-Day Shipping is available in metro hubs for a flat fee of ₹149.
4. Tracking: Real-time tracking links are automatically generated and sent via SMS and email upon order dispatch."""
            },
            {
                "title": "BuySmart Return, Refund & Replacement Policy",
                "type": "policy",
                "source": "store_policies/returns.md",
                "content": """# BuySmart 7-Day Replacement and Return Policy
1. Eligibility: Customers can initiate a return or replacement request within 7 calendar days of physical delivery.
2. Conditions for Return:
   - The product must be in its original packaging including all brand tags, manuals, warranty cards, chargers, and accessories.
   - For electronics (Laptops, Smartphones), the item will undergo a technical diagnosis verification by our service partner.
   - Manufacturing defects or transit damage are replaced free of cost.
3. Refund Processing:
   - Prepaid orders (UPI, Credit/Debit card, NetBanking): Refunds are initiated within 24 hours of item pickup and reflect in your account within 3-5 banking days.
   - Instant wallet refunds are available immediately upon pickup confirmation."""
            },
            {
                "title": "Comprehensive Electronics Warranty Guidelines",
                "type": "policy",
                "source": "store_policies/warranty.md",
                "content": """# Brand Warranty and Service Guide
1. All laptops, smartphones, and audio equipment sold on BuySmart are 100% genuine with official manufacturer warranty.
2. Standard Warranties:
   - Apple products: 1 Year Global Apple Care Warranty, valid at all Authorized Apple Service Centers.
   - ASUS & Acer Laptops: 1 Year Brand Onsite Hardware Warranty with complimentary pickup and drop support.
   - Sony & Bose Audio: 1 Year Official National Warranty covering acoustic drivers and ANC circuit boards.
3. Accidental and Liquid Damage: Standard brand warranty covers hardware defects but does not cover water spill or physical screen drops unless an extended accidental damage plan was purchased."""
            },
            {
                "title": "Laptop Buying Guide & Programming FAQs",
                "type": "faq",
                "source": "guides/laptop_programming_guide.md",
                "content": """# Laptop Guide for Programming, Machine Learning, and Engineering
1. RAM Recommendation:
   - For web development, Python scripting, and college coursework: At least 16GB RAM is highly recommended to run Docker containers, VS Code, and browser tabs smoothly.
   - For Machine Learning and Deep Learning: Look for an NVIDIA dedicated GPU (e.g., RTX 3050 or RTX 4060) with CUDA core acceleration.
2. Budget Programming Recommendations under ₹60,000:
   - Acer Swift Go 14 OLED: Unbeatable display (2.8K OLED 90Hz), lightweight, 16GB LPDDR5 RAM, powerful Intel 13th Gen i5.
   - ASUS TUF Gaming F15: Dedicated RTX 3050 4GB GPU, dual fans, expandable RAM, ideal for ML models and gaming under ₹60,000.
   - Lenovo IdeaPad Slim 3: AMD Ryzen 7 5700U with 8 cores, excellent battery life and multitasking under ₹50,000."""
            },
            {
                "title": "Smartphone Buying Guide: Camera & Battery Priorities",
                "type": "faq",
                "source": "guides/smartphone_guide.md",
                "content": """# Smartphone Selection Guide
1. Best Camera Under ₹25,000:
   - OnePlus Nord CE 4 5G features a Sony LYT-600 50MP sensor with Optical Image Stabilization (OIS), offering crisp low-light clarity and 100W rapid charging.
   - Redmi Note 13 Pro 5G features a 200MP sensor with 2x and 4x in-sensor zoom for ultra-detailed portraits.
2. Fast Charging Standards:
   - OnePlus uses SUPERVOOC charging (100W can top up a 5500mAh battery in under 30 minutes).
   - Apple iPhones support USB-PD 20W+ charging (reaching 50% in approximately 30 minutes).
3. Software Updates:
   - Google Pixel 8a offers an unprecedented 7 years of Android OS and security updates."""
            }
        ]

        for kdoc in knowledge_docs:
            DocumentService.ingest_document(
                db=db,
                title=kdoc["title"],
                content=kdoc["content"],
                document_type=kdoc["type"],
                source=kdoc["source"]
            )

        # 6. SEED INITIAL SAMPLE ORDERS (for DBMS analytics & Order History demo)
        if db.query(Order).count() == 0 and len(created_products) >= 13:
            print("Seeding Sample Orders...")
            o1 = Order(user_id=customer1.id, total_amount=created_products[0].price + created_products[12].price, order_status="completed")
            db.add(o1)
            db.flush()
            db.add(OrderItem(order_id=o1.id, product_id=created_products[0].id, quantity=1, unit_price=created_products[0].price))
            db.add(OrderItem(order_id=o1.id, product_id=created_products[12].id, quantity=1, unit_price=created_products[12].price))

            o2 = Order(user_id=customer2.id, total_amount=created_products[6].price, order_status="completed")
            db.add(o2)
            db.flush()
            db.add(OrderItem(order_id=o2.id, product_id=created_products[6].id, quantity=1, unit_price=created_products[6].price))
            db.commit()

        # Additional multi-category sample orders for Ananya (if she has no orders yet)
        if db.query(Order).filter(Order.user_id == customer3.id).count() == 0 and len(created_products) >= 24:
            print("Seeding Additional Multi-Category Orders...")
            o3 = Order(
                user_id=customer3.id,
                total_amount=round(created_products[3].price + created_products[21].price * 2, 2),
                order_status="completed"
            )
            db.add(o3)
            db.flush()
            db.add(OrderItem(order_id=o3.id, product_id=created_products[3].id, quantity=1, unit_price=created_products[3].price))
            db.add(OrderItem(order_id=o3.id, product_id=created_products[21].id, quantity=2, unit_price=created_products[21].price))

            o4 = Order(
                user_id=customer3.id,
                total_amount=round(created_products[18].price + created_products[22].price, 2),
                order_status="processing"
            )
            db.add(o4)
            db.flush()
            db.add(OrderItem(order_id=o4.id, product_id=created_products[18].id, quantity=1, unit_price=created_products[18].price))
            db.add(OrderItem(order_id=o4.id, product_id=created_products[22].id, quantity=1, unit_price=created_products[22].price))
            db.commit()

        # 6b. SEED SAMPLE BOOKMARKS & ACTIVE CART ITEMS (for Wishlist & Cart Abandonment queries)
        if db.query(ProductBookmark).count() == 0 and len(created_products) >= 25:
            print("Seeding Product Bookmarks...")
            bookmarks_to_add = [
                (customer1.id, created_products[3].id),
                (customer1.id, created_products[14].id),
                (customer2.id, created_products[8].id),
                (customer3.id, created_products[4].id),
                (customer4.id, created_products[1].id),
                (customer4.id, created_products[12].id),
            ]
            for u_id, p_id in bookmarks_to_add:
                db.add(ProductBookmark(user_id=u_id, product_id=p_id))
            db.commit()

        if db.query(CartItem).count() == 0 and len(created_products) >= 24:
            print("Seeding Sample Cart Items...")
            priya_cart = db.query(Cart).filter(Cart.user_id == customer2.id).first()
            rahul_cart = db.query(Cart).filter(Cart.user_id == customer4.id).first()
            if priya_cart:
                db.add(CartItem(cart_id=priya_cart.id, product_id=created_products[14].id, quantity=1))
                db.add(CartItem(cart_id=priya_cart.id, product_id=created_products[23].id, quantity=1))
            if rahul_cart:
                db.add(CartItem(cart_id=rahul_cart.id, product_id=created_products[1].id, quantity=1))
                db.add(CartItem(cart_id=rahul_cart.id, product_id=created_products[22].id, quantity=2))
            db.commit()

        # 7. ENSURE DBMS SUMMARY VIEW EXISTS (PostgreSQL)
        if "postgresql" in str(engine.url):
            db.execute(text("""
                CREATE OR REPLACE VIEW view_product_catalog_summary AS
                SELECT 
                    p.id AS product_id,
                    p.name AS product_name,
                    p.brand,
                    c.name AS category_name,
                    p.price,
                    p.stock_quantity,
                    CASE 
                        WHEN p.stock_quantity = 0 THEN 'OUT OF STOCK'
                        WHEN p.stock_quantity < 5 THEN 'LOW STOCK'
                        ELSE 'IN STOCK'
                    END AS inventory_status,
                    COALESCE(ROUND(AVG(pr.rating), 2), 0.0) AS avg_rating,
                    COUNT(pr.id) AS total_reviews
                FROM products p
                JOIN categories c ON p.category_id = c.id
                LEFT JOIN product_reviews pr ON p.id = pr.product_id
                GROUP BY p.id, p.name, p.brand, c.name, p.price, p.stock_quantity;
            """))
            db.commit()

        print("\n========================================================")
        print("SEEDING COMPLETE!")
        print(f"Products Created: {len(created_products)} catalog items across 5 categories.")
        print("Knowledge Base Ingested: Shipping, Return, Warranty, Guides & FAQs.")
        print("Default Accounts:")
        print("  - Admin: admin@buysmart.com / admin123")
        print("  - Customer: john@example.com / customer123")
        print("  - Customer: priya@example.com / customer123")
        print("========================================================\n")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
