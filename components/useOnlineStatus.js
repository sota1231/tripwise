import { useEffect, useState } from "react";

export default function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine); // navigator.onLineはブラウザ組み込みプロパティ

  useEffect(() => {
    const goOnline = () => setIsOnline(true); // オンラインに戻った時
    const goOffline = () => setIsOnline(false); 

    window.addEventListener("online", goOnline); // goOnlineがTrueの時online発火
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline); // それぞれのイベントリスナー削除
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return isOnline;
}
