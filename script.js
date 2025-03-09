let isYamlToJson = true;

document
  .getElementById("toggleConversionButton")
  .addEventListener("click", () => {
    isYamlToJson = !isYamlToJson;

    document.getElementById("toggleConversionButton").textContent = isYamlToJson
      ? "Switch to JSON to YAML"
      : "Switch to YAML to JSON";
    document.getElementById("yamlInput").placeholder = isYamlToJson
      ? "Enter YAML here..."
      : "Enter JSON here...";
    document.getElementById("jsonOutput").placeholder = isYamlToJson
      ? "JSON output..."
      : "YAML output...";
    document.getElementById("convertButton").textContent = isYamlToJson
      ? "Convert to JSON"
      : "Convert to YAML";
    document.getElementById("downloadButton").textContent = isYamlToJson
      ? "Download JSON"
      : "Download YAML";
    document.getElementById("uploadButton").textContent = isYamlToJson
      ? "Upload YAML"
      : "Upload JSON";
  });

function detectFormat(text) {
  text = text.trim();
  if (text.startsWith("{") || text.startsWith("[")) {
    return "json";
  } else {
    return "yaml";
  }
}

function updateModeBasedOnFormat(format) {
  const isJsonFormat = format === "json";
  isYamlToJson = !isJsonFormat;

  document.getElementById("yamlInput").placeholder = isYamlToJson
    ? "Enter YAML here..."
    : "Enter JSON here...";
  document.getElementById("jsonOutput").placeholder = isYamlToJson
    ? "JSON output..."
    : "YAML output...";
  document.getElementById("convertButton").textContent = isYamlToJson
    ? "Convert to JSON"
    : "Convert to YAML";
  document.getElementById("downloadButton").textContent = isYamlToJson
    ? "Download JSON"
    : "Download YAML";
  document.getElementById("uploadButton").textContent = isYamlToJson
    ? "Upload YAML"
    : "Upload JSON";
  document.getElementById("toggleConversionButton").textContent = isYamlToJson
    ? "Switch to JSON to YAML"
    : "Switch to YAML to JSON";
}

document.getElementById("yamlInput").addEventListener("input", () => {
  const detectedFormat = detectFormat(
    document.getElementById("yamlInput").value
  );
  updateModeBasedOnFormat(detectedFormat);
});

document.getElementById("verifyFormatButton").addEventListener("click", () => {
  const inputText = document.getElementById("yamlInput").value.trim();

  if (!inputText) {
    alert("Please enter YAML or JSON to verify the format.");
    return;
  }

  const detectedFormat = detectFormat(
    document.getElementById("yamlInput").value
  );
  const currentFormat = isYamlToJson ? "yaml" : "json";

  if (detectedFormat === currentFormat) {
    alert("Format detected correctly as " + detectedFormat.toUpperCase());
  } else {
    updateModeBasedOnFormat(detectedFormat);
    alert(
      "Format was incorrect. Switched to " +
        detectedFormat.toUpperCase() +
        " mode."
    );
  }
});

const hiddenFileInput = document.createElement("input");
hiddenFileInput.type = "file";
hiddenFileInput.style.display = "none";
document.body.appendChild(hiddenFileInput);

document.getElementById("uploadButton").addEventListener("click", () => {
  hiddenFileInput.accept = isYamlToJson ? ".yaml,.yml" : ".json";
  hiddenFileInput.click();
});

hiddenFileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("yamlInput").value = e.target.result;
      updateLineNumbers(
        document.getElementById("yamlInput"),
        document.getElementById("yamlLineNumbers")
      );
    };
    reader.onerror = function () {
      document.getElementById("errorOutput").textContent = "Error reading file";
    };
    reader.readAsText(file);
  }
});

document.getElementById("convertButton").addEventListener("click", () => {
  const yamlInput = document.getElementById("yamlInput").value;
  const jsonOutput = document.getElementById("jsonOutput");
  const errorOutput = document.getElementById("errorOutput");
  const downloadButton = document.getElementById("downloadButton");

  try {
    if (isYamlToJson) {
      const parsedData = jsyaml.load(yamlInput);
      jsonOutput.value = JSON.stringify(parsedData, null, 2);
    } else {
      const parsedData = JSON.parse(yamlInput);
      jsonOutput.value = jsyaml.dump(parsedData);
    }
    errorOutput.textContent = "";
    downloadButton.disabled = false;
  } catch (e) {
    errorOutput.textContent = `Error: ${e.message}`;
    jsonOutput.value = "";
    downloadButton.disabled = true;
  }

  updateLineNumbers(
    document.getElementById("yamlInput"),
    document.getElementById("yamlLineNumbers")
  );
  updateLineNumbers(
    document.getElementById("jsonOutput"),
    document.getElementById("jsonLineNumbers")
  );

  document.getElementById("copyButton").disabled = !jsonOutput.value;
});

document.getElementById("clearButton").addEventListener("click", () => {
  document.getElementById("yamlInput").value = "";
  document.getElementById("jsonOutput").value = "";
  document.getElementById("searchTerm").value = "";
  document.getElementById("replaceTerm").value = "";
  document.getElementById("errorOutput").textContent = "";
  document.getElementById("downloadButton").disabled = true;
  document.getElementById("copyButton").disabled = true;

  updateLineNumbers(
    document.getElementById("yamlInput"),
    document.getElementById("yamlLineNumbers")
  );
  updateLineNumbers(
    document.getElementById("jsonOutput"),
    document.getElementById("jsonLineNumbers")
  );
});

document.getElementById("downloadButton").addEventListener("click", () => {
  const outputContent = document.getElementById("jsonOutput").value;
  const fileType = isYamlToJson ? "application/json" : "application/x-yaml";
  const fileExtension = isYamlToJson ? "json" : "yaml";
  const blob = new Blob([outputContent], { type: fileType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `output.${fileExtension}`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("copyButton").addEventListener("click", function () {
  const jsonOutput = document.getElementById("jsonOutput");
  const copyButton = document.getElementById("copyButton");

  if (jsonOutput.value) {
    navigator.clipboard
      .writeText(jsonOutput.value)
      .then(() => {
        copyButton.textContent = "Copied!";

        setTimeout(() => {
          copyButton.textContent = "Copy to Clipboard";
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }
});

document.getElementById("searchReplaceButton").addEventListener("click", () => {
  const searchTerm = document.getElementById("searchTerm").value;
  const replaceTerm = document.getElementById("replaceTerm").value;
  const yamlInput = document.getElementById("yamlInput");
  const jsonOutput = document.getElementById("jsonOutput");

  if (!searchTerm) {
    alert("Please enter a text to search.");
    return;
  }

  const foundInInput = yamlInput.value.includes(searchTerm);
  const foundInOutput = jsonOutput.value.includes(searchTerm);

  if (!foundInInput && !foundInOutput) {
    alert("The text you are trying to search and replace is not present.");
    return;
  }

  if (foundInInput) {
    yamlInput.value = yamlInput.value.replace(
      new RegExp(searchTerm, "g"),
      replaceTerm
    );
    updateLineNumbers(yamlInput, document.getElementById("yamlLineNumbers"));
  }

  if (foundInOutput) {
    jsonOutput.value = jsonOutput.value.replace(
      new RegExp(searchTerm, "g"),
      replaceTerm
    );
    updateLineNumbers(jsonOutput, document.getElementById("jsonLineNumbers"));
  }
});

function updateLineNumbers(textArea, lineNumberElement) {
  const lines = textArea.value.split("\n").length;
  let lineNumbers = "";
  for (let i = 1; i <= lines; i++) {
    lineNumbers += i + "\n";
  }
  lineNumberElement.textContent = lineNumbers;
}

document.getElementById("yamlInput").addEventListener("input", function () {
  updateLineNumbers(this, document.getElementById("yamlLineNumbers"));
});

document.getElementById("yamlInput").addEventListener("scroll", function () {
  document.getElementById("yamlLineNumbers").scrollTop = this.scrollTop;
});

document.getElementById("jsonOutput").addEventListener("input", function () {
  updateLineNumbers(this, document.getElementById("jsonLineNumbers"));
});

document.getElementById("jsonOutput").addEventListener("scroll", function () {
  document.getElementById("jsonLineNumbers").scrollTop = this.scrollTop;
});

updateLineNumbers(
  document.getElementById("yamlInput"),
  document.getElementById("yamlLineNumbers")
);
updateLineNumbers(
  document.getElementById("jsonOutput"),
  document.getElementById("jsonLineNumbers")
);
