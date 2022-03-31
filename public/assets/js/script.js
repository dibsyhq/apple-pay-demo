const applePayButton = document.querySelector("apple-pay-button");

applePayButton.addEventListener("click", async (e) => {
  e.preventDefault();
  onApplePayButtonClicked();
});

function onApplePayButtonClicked() {
  if (!ApplePaySession) {
    return;
  }

  const request = {
    countryCode: "QA",
    currencyCode: "QAR",
    merchantCapabilities: ["supports3DS"],
    supportedNetworks: ["visa", "masterCard"],
    total: {
      label: "Insurance",
      type: "final",
      amount: "50",
    },
  };

  const session = new ApplePaySession(3, request);

  // Open the payment sheet
  session.onvalidatemerchant = (event) => {
    

    // Fetch the merchant session to validate the payment request
    fetch("/payments/applepay/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    })
      .then((res) => res.json()) // Parse response as JSON.
      .then((merchantSession) => {
        session.completeMerchantValidation(merchantSession);
      })
      .catch((err) => {
        console.error("Error fetching merchant session", err);
      });
  };

  // Process token and respond to customer
  session.onpaymentauthorized = async (event) => {
    var isSuccess;

    try {
      const response = await fetch("/payments/applepay/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event.payment.token),
      });
      isSuccess = {
        status: 0,
      };
    } catch (error) {
      isSuccess = {
        status: 1,
      };
    }
    session.completePayment(isSuccess);
  };

  session.oncancel = (event) => {
    alert("Payment has been cancelled");
  };

  session.begin();
}