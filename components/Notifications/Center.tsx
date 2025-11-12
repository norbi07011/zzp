import React, { useState, useContext } from "react";
import { BellIcon } from "../icons";
import { NotificationContext } from "../../contexts/NotificationContext";

export const NotificationCenter: React.FC = () => {
  const { notifications, markAsRead } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <BellIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span
            className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
            style={{ fontSize: "0.6rem" }}
          >
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-30"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="p-3 font-bold border-b dark:border-gray-700">
            Powiadomienia
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <li
                  key={n.id}
                  className={`p-3 border-b dark:border-gray-700 ${
                    !n.isRead ? "bg-primary-50 dark:bg-primary-900/20" : ""
                  }`}
                >
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    {n.message}
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex justify-between">
                    <span>{new Date(n.timestamp).toLocaleString()}</span>
                    {!n.isRead && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="font-semibold hover:underline"
                      >
                        Oznacz jako przeczytane
                      </button>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <p className="p-4 text-sm text-gray-500">
                Brak nowych powiadomień.
              </p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
