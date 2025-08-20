"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const identifier = (params as any).identifier || (params as any).slug;

  useEffect(() => {
    if (identifier) {
      router.replace(`/portfolio-info/${identifier}`);
    }
  }, [identifier, router]);

  return null;
}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="bg-[#1E2132] border border-[#2E313C] rounded-xl p-3 sm:p-4 md:p-6"
            >
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center mb-4 sm:mb-6">
                <User size={18} className="text-purple-400 mr-2" />
                Personal Information
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#262A3E] rounded-lg">
                  <User size={14} className="text-purple-400 sm:size-8" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-400">
                      Full Name
                    </p>
                    <p className="text-sm sm:text-base text-white font-medium truncate">
                      {portfolioData.personalInfo?.fullName || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#262A3E] rounded-lg">
                  <Mail size={14} className="text-blue-400 sm:size-8" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-400">Email</p>
                    <p className="text-sm sm:text-base text-white font-medium truncate">
                      {portfolioData.personalInfo?.email || "Not provided"}
                    </p>
                  </div>
                </div>

                {portfolioData.personalInfo?.phone && (
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#262A3E] rounded-lg">
                    <Phone size={14} className="text-green-400 sm:size-8" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-400">Phone</p>
                      <p className="text-sm sm:text-base text-white font-medium">
                        {portfolioData.personalInfo.phone}
                      </p>
                    </div>
                  </div>
                )}

                {portfolioData.personalInfo?.location && (
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#262A3E] rounded-lg">
                    <MapPin size={14} className="text-red-400 sm:size-8" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-400">
                        Location
                      </p>
                      <p className="text-sm sm:text-base text-white font-medium">
                        {portfolioData.personalInfo.location}
                      </p>
                    </div>
                  </div>
                )}

                {portfolioData.contactInfo?.availability && (
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#262A3E] rounded-lg">
                    <Activity
                      size={14}
                      className="text-orange-400 sm:size-8"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-400">
                        Availability
                      </p>
                      <p className="text-sm sm:text-base text-white font-medium">
                        {portfolioData.contactInfo.availability}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="bg-[#1E2132] border border-[#2E313C] rounded-xl p-3 sm:p-4 md:p-6"
            >
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center mb-4 sm:mb-6">
                <Code size={18} className="text-green-400 mr-2" />
                Skills ({portfolioData.skills?.length || 0})
              </h2>

              <div className="space-y-2 sm:space-y-3">
                {portfolioData.skills?.length > 0 ? (
                  portfolioData.skills.map((skill: any, index: number) => (
                    <div
                      key={index}
                      className="bg-[#262A3E] rounded-lg p-2 sm:p-3"
                    >
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-sm sm:text-base text-white font-medium">
                          {skill.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {skill.category}
                        </span>
                      </div>
                      <div className="w-full bg-[#1E2132] rounded-full h-1.5 sm:h-2">
                        <div
                          className={`h-1.5 sm:h-2 rounded-full ${skill.color || "bg-purple-500"}`}
                          style={{ width: `${(skill.level / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">
                        {skill.level}/5
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4 text-sm">
                    No skills added yet
                  </p>
                )}
              </div>
            </motion.div>

            {/* Analytics Quick View */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="bg-[#1E2132] border border-[#2E313C] rounded-xl p-4 sm:p-6"
            >
              <h2 className="text-xl font-bold text-white flex items-center mb-6">
                <BarChart3 size={20} className="text-blue-400 mr-2" />
                Quick Analytics
              </h2>

              <div className="space-y-4">
                <div className="bg-[#262A3E] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Portfolio Views</span>
                    <span className="text-2xl font-bold text-white">
                      {portfolioData.analytics?.views || 0}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last viewed:{" "}
                    {portfolioData.analytics?.lastViewedAt
                      ? formatDate(portfolioData.analytics.lastViewedAt)
                      : "Never"}
                  </div>
                </div>

                <div className="bg-[#262A3E] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white font-medium">
                      {formatDate(portfolioData.analytics?.createdAt || "")}
                    </span>
                  </div>
                </div>

                <div className="bg-[#262A3E] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Last Updated</span>
                    <span className="text-white font-medium">
                      {formatDate(portfolioData.analytics?.updatedAt || "")}
                    </span>
                  </div>
                </div>

                <div className="bg-[#262A3E] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        portfolioData.settings?.isPublic
                          ? "bg-green-900/50 text-green-300"
                          : "bg-gray-900/50 text-gray-300"
                      }`}
                    >
                      {portfolioData.settings?.isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Projects Section */}
          {portfolioData.projects && portfolioData.projects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="mt-8 bg-[#1E2132] border border-[#2E313C] rounded-xl p-4 sm:p-6"
            >
              <h2 className="text-xl font-bold text-white flex items-center mb-6">
                <Briefcase size={20} className="text-purple-400 mr-2" />
                Projects ({portfolioData.projects.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolioData.projects.map((project: any, index: number) => (
                  <div key={index} className="bg-[#262A3E] rounded-lg p-4">
                    {project.imageUrl && (
                      <div className="mb-3">
                        <img
                          src={project.imageUrl}
                          alt={project.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <h3 className="text-white font-semibold mb-2">
                      {project.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">
                      {project.description}
                    </p>

                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.technologies.map(
                            (tech: string, techIndex: number) => (
                              <span
                                key={techIndex}
                                className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                              >
                                {tech}
                              </span>
                            )
                          )}
                        </div>
                      )}

                    <div className="flex gap-2">
                      {project.liveUrl && (
                        <button
                          onClick={() => window.open(project.liveUrl, "_blank")}
                          className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 py-2 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <ExternalLink size={12} />
                          Live
                        </button>
                      )}
                      {project.repoUrl && (
                        <button
                          onClick={() => window.open(project.repoUrl, "_blank")}
                          className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 py-2 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <Code size={12} />
                          Code
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Education Section */}
          {portfolioData.education && portfolioData.education.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className="mt-8 bg-[#1E2132] border border-[#2E313C] rounded-xl p-4 sm:p-6"
            >
              <h2 className="text-xl font-bold text-white flex items-center mb-6">
                <GraduationCap size={20} className="text-blue-400 mr-2" />
                Education ({portfolioData.education.length})
              </h2>

              <div className="space-y-4">
                {portfolioData.education.map((edu: any, index: number) => (
                  <div key={index} className="bg-[#262A3E] rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-1">
                      {edu.degree}
                    </h3>
                    <p className="text-purple-400 mb-1">{edu.institution}</p>
                    <p className="text-gray-400 text-sm mb-2">{edu.years}</p>
                    <p className="text-gray-300 text-sm">{edu.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Experience Section */}
          {portfolioData.experience && portfolioData.experience.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.3 }}
              className="mt-8 bg-[#1E2132] border border-[#2E313C] rounded-xl p-6 sm:p-8"
            >
              <h2 className="text-xl font-bold text-white flex items-center mb-6">
                <Award size={20} className="text-green-400 mr-2" />
                Experience ({portfolioData.experience.length})
              </h2>

              <div className="space-y-4">
                {portfolioData.experience.map((exp: any, index: number) => (
                  <div key={index} className="bg-[#262A3E] rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-1">
                      {exp.jobTitle}
                    </h3>
                    <p className="text-blue-400 mb-1">{exp.company}</p>
                    <p className="text-gray-400 text-sm mb-2">
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}{" "}
                      • {exp.location}
                    </p>
                    <p className="text-gray-300 text-sm">{exp.description}</p>
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {exp.achievements.map(
                          (achievement: string, achIndex: number) => (
                            <li
                              key={achIndex}
                              className="text-gray-400 text-sm ml-4"
                            >
                              • {achievement}
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.3 }}
            className="mt-8 bg-[#1E2132] border border-[#2E313C] rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white flex items-center mb-6">
              <Sparkles size={20} className="text-purple-400 mr-2" />
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  const editUrl =
                    portfolioType === "template1"
                      ? "/templateForm?templateOne"
                      : "/templateForm?templateTwo";
                  router.push(editUrl);
                }}
                className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 size={16} />
                Edit Portfolio
              </button>

              <button
                onClick={() =>
                  window.open(portfolioData.links?.publicUrl, "_blank")
                }
                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} />
                View Live
              </button>

              <button
                onClick={() =>
                  copyToClipboard(portfolioData.links?.publicUrl || "")
                }
                className="bg-green-600/20 hover:bg-green-600/30 text-green-300 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Share2 size={16} />
                Share Link
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute right-0 top-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl"></div>
        <div className="absolute left-1/4 bottom-0 w-64 h-64 bg-purple-800/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-indigo-900/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default PortfolioInfoPage;
