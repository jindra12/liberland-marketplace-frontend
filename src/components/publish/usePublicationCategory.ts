import { useEffect, useState } from "react";
import useLocalStorage from "use-local-storage";
import type { Category, TourType } from "../tour/types";
import { TOUR_LOCAL_STORAGE_KEY, getTourCategory } from "../tour/utils";

export const usePublicationCategory = (defaultCategory?: Category) => {
    const [pendingTourType, setPendingTourType] = useLocalStorage<TourType | undefined>(
        TOUR_LOCAL_STORAGE_KEY,
        undefined,
    );
    const [category, setCategory] = useState<Category | undefined>(
        () => defaultCategory || getTourCategory(pendingTourType),
    );
    useEffect(() => {
        setPendingTourType(undefined);
    }, [setPendingTourType]);
    return { category, setCategory };
};
