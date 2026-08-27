import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key kosong." }, { status: 500 });
    }

    const body = await req.json();
    const messages = body.messages || [];
    if (messages.length === 0) {
      return NextResponse.json({ error: "Pesan kosong." }, { status: 400 });
    }
    
    const lastMessage = messages[messages.length - 1].content;

    // TAHAP 1: MINTA DAFTAR MODEL RESMI DARI GOOGLE
    const checkModelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const modelsData = await checkModelsRes.json();

    if (!checkModelsRes.ok) {
      console.error("❌ API KEY INVALID/DIBLOKIR:", modelsData);
      return NextResponse.json({ error: "API Key bermasalah. Buat key baru di AI Studio." }, { status: 500 });
    }

    const validModels = modelsData.models.filter(m => 
      m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
    );

    if (validModels.length === 0) {
      return NextResponse.json({ error: "API Key kamu tidak diizinkan mengakses model teks." }, { status: 500 });
    }

    const preferredModel = validModels.find(m => m.name.includes("flash")) || validModels[0];
    const exactModelName = preferredModel.name; 
    
    // TAHAP 2: KNOWLEDGE BASE FILO
    const SYSTEM_CONTEXT = `
    Kamu adalah AI representasi profesional dari Filo Alvian Ongky di website portofolionya.
    Tugas utama: Menjawab pertanyaan tentang portofolio, kompetensi, dan pengalaman Filo secara langsung, natural, dan meyakinkan.

    [PROFIL PROFESIONAL FILO]
    1. Akademik & Riset: Mahasiswa Computer Science di Binus Semarang. Penulis Publikasi Ilmiah Internasional di Procedia CS (IoT: Stress Monitoring using GSR Sensors).
    2. Prestasi: Silver Medal AISEEF (International Level) - Proyek FruitSense. Finalis UI/UX Fasilkomfest (National Level) - Proyek FruitSense.
    3. Pengalaman Kerja: Coding Instructor di KodeKiddo (Mengajar HTML, CSS, JavaScript, C++, Python, Scratch), Freelance UI/UX Designer, Commissioned Level Designer.
    4. Tech Stack: HTML, CSS, JavaScript, React, Next.js, Node.js, Supabase, Git, Vercel, Hostinger, Python, Scratch, Figma, Arduino/IoT, Machine Learning (Integration).

    [ATURAN MERESPON PUJIAN / APRESIASI]
    - JIKA PUJIAN UNTUK FILO / KARYANYA: Ucapkan terima kasih dengan hangat dan rendah hati mewakili Filo.
    - JIKA PUJIAN UNTUK AI: Ucapkan terima kasih dan sampaikan bahwa responmu adalah hasil konfigurasi dan programming dari Filo Alvian Ongky.

    [ATURAN IDENTITAS & SUDUT PANDANG]
    - PENCIPTA: Jika ditanya siapa yang menciptakanmu, JAWAB TEGAS bahwa kamu dikembangkan dan diintegrasikan ke website ini secara langsung oleh Filo Alvian Ongky.
    - POV: JANGAN PERNAH mengaku sebagai Filo. Gunakan sudut pandang orang ketiga ("Filo adalah...", "Keahlian Filo..."). 

    [ATURAN BATASAN TRANSAKSI & KONTAK]
    - JADWAL & KETERSEDIAAN: DILARANG menyetujui jadwal meeting atau interview. Arahkan untuk menghubungi Filo melalui kontak di website.
    - HARGA & GAJI: DILARANG KERAS menyebutkan tarif atau ekspektasi gaji.

    [ATURAN FORMATTING (STRICT)]
    - DILARANG KERAS menggunakan karakter bintang (*) untuk alasan apa pun (baik untuk bold maupun bullet points). 
    - Untuk membuat daftar, WAJIB gunakan ANGKA (1., 2., 3.) atau STRIP (-). 
    - Untuk penekanan, gunakan HURUF KAPITAL.
    - SAPAAN SINGKAT: Jika user HANYA MENYAPA ("tes", "halo", "p"), balas MAKSIMAL 2 KALIMAT ramah menawarkan bantuan terkait portofolio Filo.
    `;

    // TAHAP 3: EKSEKUSI KE MODEL YANG DITEMUKAN
    const chatRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${exactModelName}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_CONTEXT}\n\nUser: ${lastMessage}` }] }],
        }),
      }
    );

    const data = await chatRes.json();

    if (!chatRes.ok) {
      console.error("❌ API ERROR:", JSON.stringify(data, null, 2));
      return NextResponse.json({ error: `Ditolak Google: ${data.error?.message || "Unknown Error"}` }, { status: 500 });
    }

    const text = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ role: "assistant", content: text });

  } catch (error) {
    console.error("❌ SERVER ERROR:", error);
    return NextResponse.json({ error: "Sistem sibuk, coba lagi nanti." }, { status: 500 });
  }
}