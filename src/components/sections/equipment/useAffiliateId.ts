import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GetSecretParams {
  name: string;
}

type RPCResponse = {
  data: string | null;
}

export function useAffiliateId() {
  const [affiliateId, setAffiliateId] = useState<string>("");
  
  useEffect(() => {
    const getAffiliateId = async () => {
      const { data, error } = await supabase.rpc<RPCResponse, GetSecretParams>('get_secret', {
        name: 'AMAZON_AFFILIATE_KEY'
      });
      
      if (error) {
        console.error('Error fetching affiliate ID:', error);
        return;
      }
      
      if (data && typeof data === 'string') {
        setAffiliateId(data);
      }
    };

    getAffiliateId();
  }, []);

  return affiliateId;
}