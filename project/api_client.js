class ApiClient {
  constructor() {
    this.baseUrl = "http://localhost:5000/api";
  }

  async sendDocumentToServer(file) {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`${this.baseUrl}/analyze-document`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      console.log("AntiGravity AI Server Response:", data);
      
      // Map the server's clean response format back into the structure our extension expects
      return {
          type: data.document_type,
          label: data.document_type.toUpperCase() + ' CARD (AI PARSED)',
          parsedData: data.fields
      };
      
    } catch (error) {
      console.error("API Upload Error:", error);
      throw error;
    }
  }

  async sendTextQuery(query, context = "") {
    try {
      const response = await fetch(`${this.baseUrl}/text-query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query, context })
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      console.log("AntiGravity AI Chat Response:", data);
      return data;
    } catch (error) {
      console.error("API Chat Error:", error);
      throw error;
    }
  }
}

window.ApiClient = ApiClient;
