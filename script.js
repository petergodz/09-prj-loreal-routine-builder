/* Get references to DOM elements */
// Get references to the HTML elements we need
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
// Store chat history as an array of {role, content}
let chatHistory = [];

// Function to update the chat window with all history
function renderChatHistory() {
  chatWindow.innerHTML = chatHistory
    .map((msg) => {
      if (msg.role === "user") {
        return `<div class='chat-user'><strong>You:</strong> ${msg.content}</div>`;
      } else {
        return `<div class='chat-assistant'><strong>Assistant:</strong> ${msg.content}</div>`;
      }
    })
    .join("");
}

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
// Function to fetch products by category
async function fetchProductsByCategory(category) {
  // Fetch all products from products.json
  const response = await fetch("products.json");
  const data = await response.json();
  // If products are in a 'products' array, use that
  const allProducts = data.products ? data.products : data;
  // Filter products by selected category
  return allProducts.filter((product) => product.category === category);
}

/* Create HTML for displaying product cards */
// Function to display products with images
// Store selected product indices
// Store selected product ids so selection persists across category changes and reloads
let selectedProductIds = [];

// Load selected products from localStorage if available
if (localStorage.getItem("selectedProductIds")) {
  try {
    selectedProductIds = JSON.parse(localStorage.getItem("selectedProductIds"));
  } catch (e) {
    selectedProductIds = [];
  }
}
// Ensure selected products are shown after reload
window.addEventListener("DOMContentLoaded", () => {
  updateSelectedProducts();
});

function displayProducts(products) {
  productsContainer.innerHTML = "";
  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className =
      "product-card" +
      (selectedProductIds.includes(product.id) ? " selected" : "");
    productCard.style.position = "relative";

    // Product image
    const img = document.createElement("img");
    img.src = product.image ? product.image : "img/loreal-logo.png";
    img.alt = product.name;
    img.className = "product-image";

    // Tooltip for description
    const tooltip = document.createElement("div");
    tooltip.className = "product-tooltip";
    tooltip.textContent = product.description || "";
    tooltip.style.display = "none";
    tooltip.style.position = "absolute";
    tooltip.style.left = "0";
    tooltip.style.top = "100%";
    tooltip.style.background = "#fff8e1";
    tooltip.style.color = "#333";
    tooltip.style.border = "1px solid #e3a535";
    tooltip.style.borderRadius = "8px";
    tooltip.style.padding = "10px";
    tooltip.style.fontSize = "15px";
    tooltip.style.zIndex = "100";
    tooltip.style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)";

    img.addEventListener("mouseenter", () => {
      tooltip.style.display = "block";
    });
    img.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });

    productCard.appendChild(img);
    productCard.appendChild(tooltip);

    // Product name
    const name = document.createElement("h3");
    name.className = "product-name";
    name.textContent = product.name;
    productCard.appendChild(name);

    // Product brand
    const brand = document.createElement("p");
    brand.className = "product-brand";
    brand.textContent = product.brand ? product.brand : "";
    productCard.appendChild(brand);

    // Toggle selection on click
    productCard.addEventListener("click", () => {
      const selectedIdx = selectedProductIds.indexOf(product.id);
      if (selectedIdx === -1) {
        selectedProductIds.push(product.id);
        productCard.classList.add("selected");
      } else {
        selectedProductIds.splice(selectedIdx, 1);
        productCard.classList.remove("selected");
      }
      // Save to localStorage
      localStorage.setItem(
        "selectedProductIds",
        JSON.stringify(selectedProductIds)
      );
      updateSelectedProducts();
    });
    productsContainer.appendChild(productCard);
  });
  updateSelectedProducts();
}

// Show selected products below the heading
function updateSelectedProducts(products) {
  // Find all products from all categories
  fetch("products.json")
    .then((res) => res.json())
    .then((data) => {
      const allProducts = data.products ? data.products : data;
      const selectedList = document.getElementById("selectedProductsList");
      if (!selectedList) return;
      selectedList.innerHTML = "";
      selectedProductIds.forEach((id) => {
        const product = allProducts.find((p) => p.id === id);
        if (product) {
          const item = document.createElement("div");
          item.className = "selected-product-item";
          // Add product image
          const img = document.createElement("img");
          img.src = product.image ? product.image : "img/loreal-logo.png";
          img.alt = product.name;
          img.style.width = "40px";
          img.style.height = "40px";
          img.style.objectFit = "contain";
          img.style.marginRight = "8px";
          item.appendChild(img);
          // Add product name
          const nameSpan = document.createElement("span");
          nameSpan.textContent = product.name;
          item.appendChild(nameSpan);
          // Remove button
          const btn = document.createElement("button");
          btn.className = "remove-btn";
          btn.innerHTML = "&times;";
          btn.onclick = () => {
            selectedProductIds = selectedProductIds.filter((i) => i !== id);
            // Save to localStorage
            localStorage.setItem(
              "selectedProductIds",
              JSON.stringify(selectedProductIds)
            );
            updateSelectedProducts();
            // Re-render product cards to update selection state
            document.querySelectorAll(".product-card").forEach((card) => {
              const name = card.querySelector(".product-name").textContent;
              if (name === product.name) {
                card.classList.remove("selected");
              }
            });
          };
          item.appendChild(btn);
          selectedList.appendChild(item);
        }
      });
    });
}

/* Filter and display products when category changes */
// Listen for changes to the category dropdown
categoryFilter.addEventListener("change", async function () {
  // Get the selected category value
  const selectedCategory = categoryFilter.value;
  // Clear any existing products
  productsContainer.innerHTML = "";
  // Show loading message
  productsContainer.innerHTML = "<p>Loading products...</p>";
  try {
    // Fetch products for the selected category
    const products = await fetchProductsByCategory(selectedCategory);
    // Generate and display product images
    displayProducts(products);
    // Keep selected products below heading
    updateSelectedProducts();
  } catch (error) {
    console.error("Error loading products:", error);
    productsContainer.innerHTML =
      "<p>Error loading products. Please try again.</p>";
  }
});

/* Chat form submission handler - placeholder for OpenAI integration */
// Import the API key from secrets.js
// Make sure secrets.js is linked in index.html before script.js

// Function to send a message to OpenAI
// Function to send a message to OpenAI
async function sendMessageToOpenAI(newMessages) {
  // Add user message to history and show loading
  chatHistory.push({
    role: "user",
    content: newMessages[newMessages.length - 1].content,
  });
  renderChatHistory();
  chatWindow.innerHTML += "<div class='chat-loading'>Loading response...</div>";

  try {
    // Get the user input from the last message
    const user_input = newMessages[newMessages.length - 1].content;

    // Make direct API call to OpenAI using gpt-4o model
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o", // Using gpt-4o as specified in coding instructions
        messages: [
          {
            role: "system",
            content:
              "You are a L'Oréal Smart Routine and Product Advisor. Tailor all your responses to be about providing fantastic customer service for the L'Oréal brand providing advice about their products and services especially in the context of providing routine and product recommendations. If the user submit queries about topics unrelated to L'Oréal, beauty products, or beauty routine advice, politely indicate that you cannot answer those queries in a cheerful manner.",
          },
          {
            role: "user",
            content: user_input,
          },
        ],
      }),
    });

    // Convert response to JSON
    const data = await response.json();

    // Log the response to help with debugging
    console.log("OpenAI API response:", data);

    // Check if the response has an error
    if (data.error) {
      throw new Error(data.error.message || "OpenAI API error");
    }

    // Check for response content using the correct format
    if (
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      // Add assistant response to chat history
      chatHistory.push({
        role: "assistant",
        content: data.choices[0].message.content,
      });
      renderChatHistory();
    } else {
      // Show more helpful error message
      chatHistory.push({
        role: "assistant",
        content:
          "Sorry, I couldn't get a response. Please check your API key and try again.",
      });
      renderChatHistory();
    }
  } catch (error) {
    // Show detailed error message to help with debugging
    console.error("Error calling OpenAI API:", error);
    chatHistory.push({
      role: "assistant",
      content: `Error: ${error.message}. Please check the browser console for more details.`,
    });
    renderChatHistory();
  }
}

// Chat form submission handler
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user input from the chat form
  const userInput = document.getElementById("chatInput").value;

  // Don't send empty messages
  if (!userInput.trim()) {
    return;
  }

  // Clear the input field after getting the value
  document.getElementById("chatInput").value = "";

  // Create messages array for OpenAI
  const messages = [
    {
      role: "system",
      content: "You are a helpful assistant for L'Oréal product advice.",
    },
    { role: "user", content: userInput },
  ];

  // Send message to OpenAI and show response
  await sendMessageToOpenAI(messages);
});

// Generate Routine button handler
const generateRoutineBtn = document.getElementById("generateRoutine");
generateRoutineBtn.addEventListener("click", async () => {
  // Fetch all products to get details of selected items
  const response = await fetch("products.json");
  const data = await response.json();
  const allProducts = data.products ? data.products : data;
  // Get selected products
  const selectedProducts = allProducts.filter((product) =>
    selectedProductIds.includes(product.id)
  );
  // Create a user message listing selected products
  let productList = selectedProducts
    .map((p) => `${p.name} (${p.brand})`)
    .join(", ");
  if (!productList) productList = "No products selected.";
  const userMessage = `Create a personalized beauty routine using these products: ${productList}`;
  // Create messages array for OpenAI
  const messages = [
    {
      role: "system",
      content:
        "You are a L'Oréal Smart Routine and Product Advisor. Suggest a step-by-step routine using the provided products.",
    },
    { role: "user", content: userMessage },
  ];

  // Send message to OpenAI and show response
  await sendMessageToOpenAI(messages);
});
