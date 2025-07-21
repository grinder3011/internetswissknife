document.addEventListener("DOMContentLoaded", function () {
  const compareBtn = document.getElementById("compare-btn");
  const resetBtn = document.getElementById("reset-btn");

  compareBtn.addEventListener("click", function () {
    const text1 = document.getElementById("text1").value;
    const text2 = document.getElementById("text2").value;

    const dmp = new diff_match_patch();
    const diffs = dmp.diff_main(text1, text2);
    dmp.diff_cleanupSemantic(diffs);

    const result = diffs.map(function (diff) {
      const op = diff[0];
      const data = diff[1];
      if (op === 1) return `<ins>${data}</ins>`;     // Insertion
      if (op === -1) return `<del>${data}</del>`;    // Deletion
      return data;                                   // Equal
    }).join("");

    document.getElementById("output").innerHTML = result;
  });

  resetBtn.addEventListener("click", function () {
    document.getElementById("text1").value = "";
    document.getElementById("text2").value = "";
    document.getElementById("output").innerHTML = "";
  });
});
