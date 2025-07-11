const API_URL = process.env.NEXT_PUBLIC_API_URL;
"use client";
import React from "react";

const NotificationButton: React.FC = () => {
  const sendNotification = async () => {
    try {
      // Enviar notificación al Service Worker
      const payload = {
        title: "Notificación de ejemplo",
        body: "Esta es una notificación enviada desde el botón.",
      };

      const response = await fetch(`API_URL/adeco/api/send-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // El backend debe manejar este payload
      });

      if (response.ok) {
        alert("Notificación enviada con éxito.");
      } else {
        alert("Error al enviar la notificación.");
      }
    } catch (error) {
      console.error("Error al enviar notificación:", error);
    }
  };

  return (
    <button
      onClick={sendNotification}
      style={{
        padding: "10px 20px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Enviar Notificación
    </button>
  );
};

export default NotificationButton;
