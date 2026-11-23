# บ้านเรา Budget — เว็บแอปรายรับรายจ่ายครอบครัว (GitHub Pages + Google Sheets)

## 1. อัปโหลดขึ้น GitHub Pages
1. สร้าง Repository ใหม่บน GitHub (เช่น `family-budget`)
2. อัปโหลดไฟล์ `index.html` ขึ้นไปที่ root ของ repo
3. ไปที่ **Settings → Pages → Branch** เลือก `main` และ `/ (root)` แล้วกด **Save**
4. รอประมาณ 1–2 นาที จะได้ลิงก์เว็บแอป `https://<username>.github.io/family-budget/`

## 2. เชื่อมต่อ Google Sheets เพื่อให้ทุกคนในครอบครัวซิงค์ข้อมูลร่วมกัน
1. สร้าง **Google Sheet** ใหม่ 1 ไฟล์ (เช่นชื่อ `บัญชีครอบครัว บ้านเรา`)
2. ไปที่เมนู **Extensions → Apps Script**
3. ลบโค้ดเดิมออกแล้ววางโค้ดจากไฟล์ `Code.gs` ทั้งหมดลงไป แล้วกด **Save**
4. กด **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. กด **Deploy** แล้วคัดลอก **Web app URL** (`https://script.google.com/macros/s/.../exec`)
6. เปิดเว็บแอปบน GitHub Pages ไปที่แท็บ **ฉัน → เชื่อมต่อ Google Sheets** วางลิงก์แล้วกดบันทึก

> **ทิปสำหรับครอบครัว:** เมื่อเชื่อมต่อแล้ว กดปุ่ม **QR / เชิญสมาชิก** ในแท็บ **ครอบครัว** เพื่อคัดลอกลิงก์เชิญ (`?api=...`) ส่งให้สมาชิกใน LINE ได้เลย พอกดเปิดบนมือถือจะเชื่อมต่อ Google Sheet ของบ้านเราให้อัตโนมัติ และสามารถกด **Add to Home Screen** เพื่อใช้งานเหมือนแอปบนมือถือได้ทันที
