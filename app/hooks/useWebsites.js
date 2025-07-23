"use client";

import { useState, useEffect } from "react";

export function useWebsites() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const res = await fetch("/api/websites");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setWebsites(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching websites:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWebsites();
  }, []);

  const updateWebsiteSection = async (websiteId, sectionPath, data) => {
    try {
      const res = await fetch(
        `/api/websites/${websiteId}/sections/${sectionPath}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update section");
      }

      const result = await res.json();

      // Update local state for immediate feedback
      setWebsites((prev) =>
        prev.map((website) => {
          if (website.id === websiteId) {
            const updatedWebsite = { ...website };

            // Handle nested path updates
            const pathParts = sectionPath.split(".");

            let current = updatedWebsite;

            // Navigate to the parent of the target property
            for (let i = 0; i < pathParts.length - 1; i++) {
              if (!current[pathParts[i]]) current[pathParts[i]] = {};
              current = current[pathParts[i]];
            }

            // Set the final property
            const finalKey = pathParts[pathParts.length - 1];
            current[finalKey] = data;

            updatedWebsite.lastUpdated = new Date();
            return updatedWebsite;
          }
          return website;
        })
      );

      return { success: true, data: result };
    } catch (error) {
      console.error("Error updating section:", error);
      return { success: false, error: error.message };
    }
  };

  const addWebsiteSection = async (websiteId, sectionPath, data) => {
    try {
      const res = await fetch(
        `/api/websites/${websiteId}/sections/${sectionPath}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add section");
      }

      const result = await res.json();

      // Update local state
      setWebsites((prev) =>
        prev.map((website) => {
          if (website.id === websiteId) {
            const updatedWebsite = { ...website };

            const pathParts = sectionPath.split(".");

            let current = updatedWebsite;

            for (let i = 0; i < pathParts.length - 1; i++) {
              if (!current[pathParts[i]]) current[pathParts[i]] = {};
              current = current[pathParts[i]];
            }

            const finalKey = pathParts[pathParts.length - 1];
            current[finalKey] = data;

            updatedWebsite.lastUpdated = new Date();
            return updatedWebsite;
          }
          return website;
        })
      );

      return { success: true, data: result };
    } catch (error) {
      console.error("Error adding section:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteWebsiteSection = async (websiteId, sectionPath) => {
    try {
      const res = await fetch(
        `/api/websites/${websiteId}/sections/${sectionPath}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete section");
      }

      // Update local state
      setWebsites((prev) =>
        prev.map((website) => {
          if (website.id === websiteId) {
            const updatedWebsite = { ...website };

            const pathParts = sectionPath.split(".");
            let current = updatedWebsite;

            if (!current) return website;

            // Navigate to parent and delete the final key
            for (let i = 0; i < pathParts.length - 1; i++) {
              if (!current[pathParts[i]]) return website;
              current = current[pathParts[i]];
            }

            const finalKey = pathParts[pathParts.length - 1];
            delete current[finalKey];

            updatedWebsite.lastUpdated = new Date();
            return updatedWebsite;
          }
          return website;
        })
      );

      return { success: true };
    } catch (error) {
      console.error("Error deleting section:", error);
      return { success: false, error: error.message };
    }
  };

  const refreshWebsites = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/websites");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setWebsites(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error refreshing websites:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    websites,
    loading,
    error,
    updateWebsiteSection,
    addWebsiteSection,
    deleteWebsiteSection,
    refreshWebsites,
  };
}

/* "use client";

import { useState, useEffect } from "react";

export default function useWebsites() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const res = await fetch("/api/websites");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setWebsites(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWebsites();
  }, []);

  return { websites, loading, error };
} */
