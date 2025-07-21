document.getElementById("compare-btn").addEventListener("click", function () {
  const text1 = document.getElementById("text1").value.trim();
  const text2 = document.getElementById("text2").value.trim();

  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(text1, text2);
  dmp.diff_cleanupSemantic(diffs);

  const result = diffs.map(([op, data]) => {
    if (op === 1) return `<ins>${escapeHtml(data)}</ins>`;   // Insertion
    if (op === -1) return `<del>${escapeHtml(data)}</del>`;  // Deletion
    return escapeHtml(data);                                 // Equal
  }).join("");

  document.getElementById("output").innerHTML = result;
});

document.getElementById("reset-btn").addEventListener("click", function () {
  document.getElementById("text1").value = "";
  document.getElementById("text2").value = "";
  document.getElementById("output").innerHTML = "";
  document.getElementById("text1").focus();
});

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
