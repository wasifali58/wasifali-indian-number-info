// WASIFALI INDIAN NUMBER INFO API
// Developer: WASIF ALI | Telegram: @FREEHACKS95

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const { number } = req.query;

  if (!number) {
    return res.status(200).send(JSON.stringify({
      success: false,
      message: "Number required",
      example: "/api?number=9876543210",
      developer: "WASIF ALI",
      telegram: "@FREEHACKS95"
    }, null, 2));
  }

  let cleanNumber = number.toString().replace(/\D/g, '');
  if (cleanNumber.startsWith('91')) cleanNumber = cleanNumber.substring(2);
  
  if (cleanNumber.length !== 10) {
    return res.status(200).send(JSON.stringify({
      success: false,
      message: "Invalid Indian number (10 digits required)",
      developer: "WASIF ALI",
      telegram: "@FREEHACKS95"
    }, null, 2));
  }

  try {
    const url1 = `https://ayaanmods.site/mobile.php?key=annonymousmobile&term=${cleanNumber}`;
    const url2 = `https://ayaanmods.site/number.php?key=annonymous&number=${cleanNumber}`;

    // Dono APIs ko call karo (parallel)
    const [res1, res2] = await Promise.allSettled([
      fetch(url1),
      fetch(url2)
    ]);

    // Unique records ke liye Map (mobile number as key)
    const uniqueMap = new Map();

    // --- API 1 se data lo ---
    if (res1.status === 'fulfilled' && res1.value.ok) {
      try {
        const data = await res1.value.json();
        if (data.success && data.result?.records) {
          for (const record of data.result.records) {
            const mobile = record.mobile || record.num;
            if (mobile && !uniqueMap.has(mobile)) {
              uniqueMap.set(mobile, {
                name: record.name,
                father_name: record.fname,
                aadhar: record.aadhar || null,
                alt: record.alt || null,
                circle: record.circle,
                email: record.email?.trim() || null,
                address: record.address?.replace(/!/g, ', ').replace(/, , /g, ', ').replace(/,$/, '') || null
              });
            }
          }
        }
      } catch(e) {}
    }

    // --- API 2 se data lo ---
    if (res2.status === 'fulfilled' && res2.value.ok) {
      try {
        const data = await res2.value.json();
        if (data.result && Array.isArray(data.result)) {
          for (const record of data.result) {
            const mobile = record.mobile;
            if (mobile && !uniqueMap.has(mobile)) {
              uniqueMap.set(mobile, {
                name: record.name,
                father_name: record.father_name,
                aadhar: record.id || null,
                alt: record.alternate || null,
                circle: record.circle,
                email: record.email?.trim() || null,
                address: record.address?.replace(/!/g, ', ').replace(/, , /g, ', ').replace(/,$/, '') || null
              });
            }
          }
        }
      } catch(e) {}
    }

    const records = Array.from(uniqueMap.values());

    if (records.length === 0) {
      return res.status(200).send(JSON.stringify({
        success: false,
        message: "No records found",
        developer: "WASIF ALI",
        telegram: "@FREEHACKS95"
      }, null, 2));
    }

    const result = {
      success: true,
      number: cleanNumber,
      total: records.length,
      records,
      developer: "WASIF ALI",
      telegram: "@FREEHACKS95"
    };

    return res.status(200).send(JSON.stringify(result, null, 2));

  } catch (error) {
    return res.status(200).send(JSON.stringify({
      success: false,
      message: "Service unavailable",
      developer: "WASIF ALI",
      telegram: "@FREEHACKS95"
    }, null, 2));
  }
}
