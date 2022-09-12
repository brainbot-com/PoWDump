import type React from "react";
import type * as PopperJS from "@popperjs/core";
import { useCallback, useRef, useState } from "react";
import { usePopper } from "react-popper";

type TooltipProps = {
    label: React.ReactElement;
    placement?: PopperJS.Placement;
    enterDelay?: number;
    leaveDelay?: number;
    strategy: 'absolute' | 'fixed';
    isReferenceHidden?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export const Tooltip: React.FC<TooltipProps> = (props) => {
    const {
        children,
        label,
        enterDelay = 150,
        leaveDelay = 150,
        placement = "bottom",
        strategy = "absolute",
        isReferenceHidden = false,
    } = props;

    const [isOpen, setIsOpen] = useState(false);
    let [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(
        null
    );
    let [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
    let { styles, attributes } = usePopper(referenceElement, popperElement, {
        placement,
        strategy: strategy,
        // isReferenceHidden: isReferenceHidden,
        modifiers: [{ name: "offset", options: { offset: [0, 4] } }],
    });

    let enterTimeout = useRef<NodeJS.Timeout>();
    let leaveTimeout = useRef<NodeJS.Timeout>();
    const handleMouseEnter = useCallback(() => {
        leaveTimeout.current && clearTimeout(leaveTimeout.current);
        enterTimeout.current = setTimeout(() => setIsOpen(true), enterDelay);
    }, [enterDelay]);
    const handleMouseLeave = useCallback(() => {
        enterTimeout.current && clearTimeout(enterTimeout.current);
        leaveTimeout.current = setTimeout(() => setIsOpen(false), leaveDelay);
    }, [leaveDelay]);

    return (
        <div>
            <div
                ref={setReferenceElement}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative"
            >
                {children}
            </div>

            <div
                ref={setPopperElement}
                style={styles.popper}
                {...attributes.popper}
                className={`transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
            >
                {label}
            </div>
        </div>
    );
};