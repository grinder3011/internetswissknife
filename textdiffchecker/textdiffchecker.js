document.addEventListener("DOMContentLoaded", function () {
  const compareBtn = document.getElementById("compare-btn");
  const resetBtn = document.getElementById("reset-btn");

  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  compareBtn.addEventListener("click", function () {
    const text1 = document.getElementById("text1").value;
    const text2 = document.getElementById("text2").value;

    const dmp = new diff_match_patch();
    const diffs = dmp.diff_main(text1, text2);
    dmp.diff_cleanupSemantic(diffs);

    const result = diffs
      .map(function (diff) {
        const op = diff[0];
        const data = escapeHTML(diff[1]); // ✅ Escape user content
        if (op === 1) return `<ins>${data}</ins>`; // insertion
        if (op === -1) return `<del>${data}</del>`; // deletion
        return data; // equal
      })
      .join("");

    document.getElementById("output").innerHTML = `<pre>${result}</pre>`;
  });

  resetBtn.addEventListener("click", function () {
    document.getElementById("text1").value = "";
    document.getElementById("text2").value = "";
    document.getElementById("output").innerHTML = "";
  });
});
