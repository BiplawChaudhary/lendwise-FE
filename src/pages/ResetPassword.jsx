import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { callApi } from "../utils/api";

export default function ResetPassword() {
  const { showToast } = useToast();
  const [resetData, setResetData] = useState("");

  const userRefVar = useRef(false);
  // const kalu = useRef("");

  const handleCheckResetLink = async (myData) => {
    console.log("RESET LINK", myData);
    if (!myData) {
      showToast("Reset data not found.", "warning");
      return;
    }

    console.log("CALLING API TO VLAIDATE RESET LINK");
    // setLoading(true);
    try {
      await callApi({
        url: "/auth/check-reset-validity",
        method: "POST",
        body: { data: myData },
        validateResponse: true,
        showToast,
      });
    } catch (e) {
        // showToast(e, "warning");
      console.log("CALLING API TO VLAIDATE RESET LINK", e);
      // toast already shown by callApi
    } finally {
      //   setLoading(false);
    }
  };

  const myData = useMemo(() => {
    const params = new URLSearchParams(window.location.search);

    const data = params.get("data");
    handleCheckResetLink(data);
    return data;
  }, []);

  //   useEffect(()=>{
  //     handleCheckResetLink(myData);
  //   });
  //   useEffect(() => {
  //     if (userRefVar.current) return;
  //     userRefVar.current = true;

  //     // if(kalu.current) return;

  //     const params = new URLSearchParams(window.location.search);
  //     const data = params.get("data");

  //     // kalu.current  =data;

  //     setResetData(data);
  //     console.log("ORIGINAL DATA =", data);

  //     window.history.replaceState({}, document.title, window.location.pathname);

  //     if (resetData) {
  //       handleCheckResetLink();
  //     }
  //   }, []);

  console.log("OUTSIDE: ", myData);

  const pageStyle = {
    minHeight: "100vh",
    background: "#f8faff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: '"Segoe UI", system-ui, sans-serif',
    padding: "20px",
  };

  const cardStyle = {
    background: "#ffffff",
    borderRadius: 16,
    padding: "48px 40px",
    maxWidth: 420,
    width: "100%",
    boxShadow: "0 4px 32px rgba(26,86,219,0.10)",
    border: "1px solid #e5edff",
  };

  return (
    <div>
      <h1>RESET PASSWORD</h1>
    </div>
  );
}
