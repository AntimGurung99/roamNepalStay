// import { XCircle } from "lucide-react";
// import { useNavigate, useSearchParams } from "react-router-dom";

// const PaymentFailed = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   const provider = searchParams.get("provider");
//   const providerName =
//     provider === "esewa"
//       ? "eSewa"
//       : provider === "khalti"
//       ? "Khalti"
//       : "payment";

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
//       <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
//         <XCircle className="mx-auto mb-4 text-red-600" size={64} />
//         <h1 className="mb-2 text-2xl font-bold text-red-600">
//           Payment Failed
//         </h1>
//         <p className="mb-6 text-gray-600">
//           Your {providerName} payment was not completed.
//         </p>

//         <div className="space-y-3">
//           <button
//             onClick={() => navigate("/my-bookings")}
//             className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
//           >
//             Go to My Bookings
//           </button>

//           <button
//             onClick={() => navigate("/")}
//             className="w-full rounded-xl border px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
//           >
//             Go to Home
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentFailed;


import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/PaymentSuccess.css";

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-success-page">
      <div className="payment-success-card">
        <XCircle className="payment-error-icon" size={64} />
        <h1 className="payment-title payment-title-error">
          Payment Failed
        </h1>
        <p className="payment-message">
          Your payment could not be completed.
        </p>

        <div className="payment-button-group">
          <button
            onClick={() => navigate("/my-bookings")}
            className="payment-btn payment-btn-primary"
          >
            Go to My Bookings
          </button>

          <button
            onClick={() => navigate("/")}
            className="payment-btn payment-btn-secondary"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;