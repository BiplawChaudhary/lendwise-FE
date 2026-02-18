// KycStepper – visual step indicator for the eKYC process

export default function KycStepper({ steps, currentStep }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        const isUpcoming = stepNum > currentStep;

        return (
          <div key={step} style={{ display: "flex", alignItems: "center", flex: index < steps.length - 1 ? 1 : "unset" }}>
            {/* Step circle */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 15,
                transition: "all 0.3s",
                background: isCompleted ? "#1a56db" : isActive ? "#1a56db" : "#e5edff",
                color: isCompleted || isActive ? "#ffffff" : "#9ca3af",
                boxShadow: isActive ? "0 0 0 4px rgba(26,86,219,0.15)" : "none",
              }}>
                {isCompleted ? "✓" : stepNum}
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#1a56db" : isCompleted ? "#374151" : "#9ca3af",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}>
                {step}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                marginBottom: 22,
                background: isCompleted ? "#1a56db" : "#e5edff",
                transition: "background 0.3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}