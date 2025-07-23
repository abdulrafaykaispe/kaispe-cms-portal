"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Globe,
  Edit3,
  Save,
  X,
  Plus,
  Settings,
  Eye,
  Activity,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  FileText,
} from "lucide-react";
import { useWebsites } from "@/app/hooks/useWebsites";
import toast from "react-hot-toast";
import Spinner from "@/app/components/Spinner";

export default function WebsiteDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const { websites, loading, updateWebsiteSection } = useWebsites();
  const [editingSection, setEditingSection] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [expandedPages, setExpandedPages] = useState({});

  const website = websites.find((w) => w.id === id);

  // Show loading spinner while data is being fetched
  if (loading) {
    return <Spinner />;
  }

  // Show not found only after loading is complete and website is not found
  if (!website) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Website not found
          </h3>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleEditSection = (sectionPath, sectionData) => {
    setEditingSection(sectionPath);
    setEditingData(sectionData);
  };

  const handleSaveSection = async () => {
    if (!editingSection) return;

    const result = await updateWebsiteSection(
      website.id,
      editingSection,
      editingData
    );

    if (result.success) {
      toast.success("Section updated successfully");
      setEditingSection(null);
      setEditingData({});
    } else {
      toast.error(result.error || "Failed to update section");
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditingData({});
  };

  const handleInputChange = (key, value) => {
    setEditingData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const togglePageExpansion = (pageName) => {
    setExpandedPages((prev) => ({
      ...prev,
      [pageName]: !prev[pageName],
    }));
  };

  const renderEditableField = (key, value, depth = 0) => {
    const isEditing = editingSection && depth === 0;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return (
        <div
          className={`space-y-3 ${
            depth > 0 ? "ml-4 border-l-2 border-gray-200 pl-4" : ""
          }`}
        >
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {subKey.replace(/([A-Z])/g, " $1").trim()}
              </label>
              {renderEditableField(subKey, subValue, depth + 1)}
            </div>
          ))}
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={typeof item === "string" ? item : JSON.stringify(item)}
                onChange={(e) => {
                  if (isEditing) {
                    const newArray = [...value];
                    newArray[index] = e.target.value;
                    handleInputChange(key, newArray);
                  }
                }}
                disabled={!isEditing}
                className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
                }`}
              />
            </div>
          ))}
        </div>
      );
    }

    const isTextArea =
      typeof value === "string" &&
      (key.toLowerCase().includes("paragraph") ||
        key.toLowerCase().includes("description") ||
        key.toLowerCase().includes("content") ||
        value.length > 100);

    if (isTextArea) {
      return (
        <textarea
          value={value || ""}
          onChange={(e) => isEditing && handleInputChange(key, e.target.value)}
          disabled={!isEditing}
          rows={4}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${
            !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
          }`}
        />
      );
    }

    return (
      <input
        type="text"
        value={value || ""}
        onChange={(e) => isEditing && handleInputChange(key, e.target.value)}
        disabled={!isEditing}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
        }`}
      />
    );
  };

  const renderSectionContent = (sectionPath, sectionData) => {
    if (!sectionData || Object.keys(sectionData).length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No content available for this section</p>
          <button
            onClick={() => handleEditSection(sectionPath, { newField: "" })}
            className="mt-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            Add content
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {Object.entries(sectionData).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </label>
            {renderEditableField(key, value)}
          </div>
        ))}
      </div>
    );
  };

  // Group sections by page
  const groupSectionsByPage = (websiteData) => {
    const pages = {};

    if (!websiteData || typeof websiteData !== "object") return pages;

    // Filter out non-page data (id, domain, etc.)
    const excludeKeys = [
      "id",
      "domain",
      "status",
      "lastUpdated",
      "navigationBar",
      "footer",
    ];

    Object.entries(websiteData).forEach(([pageKey, pageValue]) => {
      if (
        pageValue &&
        typeof pageValue === "object" &&
        !Array.isArray(pageValue) &&
        !excludeKeys.includes(pageKey)
      ) {
        pages[pageKey] = {
          name: pageKey
            .replace(/([A-Z])/g, " $1")
            .replace(/page/gi, " Page")
            .trim(),
          sections: Object.entries(pageValue).map(
            ([sectionKey, sectionValue]) => ({
              key: sectionKey,
              name: sectionKey.replace(/([A-Z])/g, " $1").trim(),
              path: `${pageKey}.${sectionKey}`,
              data: sectionValue,
            })
          ),
        };
      }
    });

    return pages;
  };

  const pageGroups = groupSectionsByPage(website);
  const totalSections = Object.values(pageGroups).reduce(
    (total, page) => total + page.sections.length,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800 capitalize">
                    {website.id.replace(/-/g, " ")}
                  </h1>
                  {website.domain && (
                    <p className="text-sm text-gray-600">{website.domain}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
              {website.domain && (
                <a
                  href={website.domain}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Visit Site</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pages</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Object.keys(pageGroups).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sections</p>
                <p className="text-2xl font-bold text-gray-800">
                  {totalSections}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-2xl font-bold text-gray-800">
                  {new Date(
                    website.lastUpdated?.seconds * 1000 || Date.now()
                  ).toLocaleDateString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pages */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Website Pages</h2>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
              <Plus className="w-4 h-4" />
              <span>Add Page</span>
            </button>
          </div>

          {Object.keys(pageGroups).length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No pages found
              </h3>
              <p className="text-gray-600">
                This website doesn&apos;t have any pages yet
              </p>
            </div>
          ) : (
            Object.entries(pageGroups).map(([pageKey, page], pageIndex) => (
              <motion.div
                key={pageKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: pageIndex * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm overflow-hidden"
              >
                {/* Page Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => togglePageExpansion(pageKey)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 capitalize">
                          {page.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {page.sections.length} section
                          {page.sections.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {page.sections.length} sections
                      </span>
                      {expandedPages[pageKey] ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Page Sections */}
                {expandedPages[pageKey] && (
                  <div className="border-t border-gray-200/50">
                    {page.sections.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No sections in this page</p>
                        <button className="mt-2 text-blue-600 hover:text-blue-800 transition-colors">
                          Add section
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200/50">
                        {page.sections.map((section, sectionIndex) => (
                          <div key={section.key} className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-md font-medium text-gray-800 capitalize">
                                {section.name}
                              </h4>
                              <div className="flex items-center space-x-2">
                                {editingSection === section.path ? (
                                  <>
                                    <button
                                      onClick={handleSaveSection}
                                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                    >
                                      <Save className="w-3 h-3" />
                                      <span>Save</span>
                                    </button>
                                    <button
                                      onClick={handleCancelEdit}
                                      className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                                    >
                                      <X className="w-3 h-3" />
                                      <span>Cancel</span>
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleEditSection(
                                        section.path,
                                        section.data
                                      )
                                    }
                                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="bg-gray-50/50 rounded-lg p-4">
                              {editingSection === section.path
                                ? renderSectionContent(
                                    section.path,
                                    editingData
                                  )
                                : renderSectionContent(
                                    section.path,
                                    section.data
                                  )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
