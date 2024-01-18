import { useEffect, useState } from "react";
import { listofCreatorERC20Tokens } from "../utils/api";
import { ERC20Token } from "../utils/types";

export function useGetTokens(publickey: string) {
  const [tokens, setTokens] = useState<ERC20Token[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      listofCreatorERC20Tokens(publickey)
        .then((result) => {
          const filteredData = result.filter((rs) => {
            return parseInt(rs.enable_mint_burn.hex, 16);
          });

          setTokens(filteredData);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    init();

    const interval = setInterval(() => init(), 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return { tokens, loading };
}
