export const sendAlert = (contact, sosData) => {
    console.log("ALERT SENT ");
    console.log("To:", contact.name, contact.phone);
    console.log("Message:", sosData.message);
    console.log("Location:", sosData.location);
    console.log("Risk:", sosData.riskLevel);
};