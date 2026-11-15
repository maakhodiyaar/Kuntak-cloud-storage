
// KUNTAK CLOUD - APP.JS

const fileInput = document.getElementById("fileInput");

const counts = {
  photo: 0,
  video: 0,
  audio: 0,
  document: 0,
  other: 0
};

const uploadedHashes = new Set();

function detectType(file) {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|webp|svg|bmp|heic)$/.test(name))
    return "photo";

  if (type.startsWith("video/") ||
      /\.(mp4|mov|mkv|avi|webm|3gp)$/.test(name))
    return "video";

  if (type.startsWith("audio/") ||
      /\.(mp3|wav|aac|m4a|ogg|flac)$/.test(name))
    return "audio";

  if (/\.(pdf|doc|docx|txt|xls|xlsx|ppt|pptx|csv)$/.test(name))
    return "document";

  return "other";
}

async function getHash(file) {
  const buffer = await file.arrayBuffer();
  const result = await crypto.subtle.digest("SHA-256", buffer);

  return Array.from(new Uint8Array(result))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function showMessage(message, success = true) {
  const box = document.getElementById("message");
  box.textContent = message;
  box.style.display = "block";
  box.style.background = success ? "#dcfce7" : "#fee2e2";
  box.style.color = success ? "#166534" : "#991b1b";
}

function updateCounts() {
  const ids = {
    photo: "photoCount",
    video: "videoCount",
    audio: "audioCount",
    document: "documentCount",
    other: "otherCount"
  };

  let total = 0;

  for (const category in counts) {
    document.getElementById(ids[category]).textContent =
      counts[category] + " files";

    total += counts[category];
  }

  document.getElementById("totalCount").textContent =
    total + " files";
}

function addFileToList(file, category) {
  const item = document.createElement("div");
  item.className = "file-item";

  const name = document.createElement("strong");
  name.textContent = "📄 " + file.name;

  const details = document.createElement("div");
  details.className = "small";
  details.textContent =
    category.toUpperCase() + " • " +
    (file.size / 1048576).toFixed(2) + " MB";

  item.appendChild(name);
  item.appendChild(details);

  document.getElementById("fileList").appendChild(item);
}

if (fileInput) {
  fileInput.addEventListener("change", async function() {
    const files = Array.from(fileInput.files);

    for (const file of files) {
      try {
        const hash = await getHash(file);

        if (uploadedHashes.has(hash)) {
          showMessage(
            "આ ફાઇલ પહેલેથી પસંદ થઈ છે: " + file.name,
            false
          );
          continue;
        }

        uploadedHashes.add(hash);

        const category = detectType(file);
        counts[category]++;

        addFileToList(file, category);

        showMessage("ફાઇલ ઓળખાઈ: " + file.name);

      } catch (error) {
        showMessage("ફાઇલ તપાસવામાં સમસ્યા આવી.", false);
      }
    }

    updateCounts();
    fileInput.value = "";
  });
}
