import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AlertContext = createContext();

export const useAlert = () => {
  return useContext(AlertContext);
};

export const AlertProvider = ({ children }) => {
  const [alertData, setAlertData] = useState(null);

  const showAlert = (message) => {
    setAlertData({ message });
  };

  const closeAlert = () => {
    setAlertData(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <AnimatePresence>
        {alertData && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-canvas/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-canvas border-2 border-maroon/20 p-6 md:p-8 rounded-2xl shadow-xl max-w-sm w-full text-center flex flex-col items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-maroon/10 flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-maroon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <p className="text-maroon font-medium text-lg leading-snug">
                {alertData.message}
              </p>
              <button
                onClick={closeAlert}
                className="mt-2 w-full py-3 bg-maroon text-cream rounded-full font-semibold hover:bg-maroon/90 transition-colors shadow-sm"
              >
                Mengerti
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
};
