import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { keyframes } from "@emotion/react";
import { useReducedMotion } from "framer-motion";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Avatar,
  Box,
  Flex,
  Grid,
  Heading,
  IconButton,
  Text,
  VisuallyHidden,
} from "@chakra-ui/react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPause,
  FiPlay,
  FiX,
} from "react-icons/fi";

import { getAwardsQuery } from "@/api/awards";
import {
  AWARD_STORIES,
  groupAwardRanks,
  isAwardScoreEligible,
  rankAwardRows,
  wrapStoryIndex,
  type AwardScoreRow,
  type RankedAwardRow,
} from "@/awards";
import TournamentLoading from "@/components/TournamentLoading";
import { pb } from "@/pb";
import type { UsersResponse } from "@/pocketbase-types";
import { queryClient } from "@/queryClient";

const STORY_DURATION_MS = 6_000;
const SWIPE_THRESHOLD_PX = 50;
const PODIUM_DISPLAY_ORDER = [2, 1, 3] as const;

const fillProgress = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`;

interface DisplayAwardRow extends AwardScoreRow {
  user?: UsersResponse;
}

export const Route = createFileRoute("/tournaments/$tournamentId/awards")({
  component: Awards,
  pendingComponent: TournamentLoading,
  loader: async ({ params }) => {
    await queryClient.ensureQueryData(getAwardsQuery(params.tournamentId));
  },
});

function Awards() {
  const { tournamentId } = Route.useParams();
  const { data: awards } = useSuspenseQuery(getAwardsQuery(tournamentId));
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(Boolean(prefersReducedMotion));
  const remainingDuration = useRef(STORY_DURATION_MS);
  const timerStartedAt = useRef<number>();
  const timerId = useRef<number>();
  const swipeStart = useRef<{ x: number; y: number }>();
  const swipeWasHandled = useRef(false);
  const story = AWARD_STORIES[activeIndex];

  const clearTimer = useCallback(() => {
    if (timerId.current !== undefined) {
      window.clearTimeout(timerId.current);
      timerId.current = undefined;
    }
  }, []);

  const changeStory = useCallback(
    (offset: number) => {
      clearTimer();
      remainingDuration.current = STORY_DURATION_MS;
      setActiveIndex((currentIndex) =>
        wrapStoryIndex(currentIndex + offset, AWARD_STORIES.length)
      );
    },
    [clearTimer]
  );

  const pauseTimer = useCallback(() => {
    if (timerId.current !== undefined && timerStartedAt.current !== undefined) {
      const elapsed = performance.now() - timerStartedAt.current;
      remainingDuration.current = Math.max(
        0,
        remainingDuration.current - elapsed
      );
    }

    clearTimer();
  }, [clearTimer]);

  useEffect(() => {
    if (prefersReducedMotion) {
      pauseTimer();
      setIsPaused(true);
    }
  }, [pauseTimer, prefersReducedMotion]);

  useEffect(() => {
    if (isPaused) return;

    timerStartedAt.current = performance.now();
    timerId.current = window.setTimeout(() => {
      timerId.current = undefined;
      remainingDuration.current = STORY_DURATION_MS;
      setActiveIndex((currentIndex) =>
        wrapStoryIndex(currentIndex + 1, AWARD_STORIES.length)
      );
    }, remainingDuration.current);

    return clearTimer;
  }, [activeIndex, clearTimer, isPaused]);

  const togglePaused = () => {
    if (!isPaused) pauseTimer();
    setIsPaused((currentValue) => !currentValue);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("a, button, input, textarea")) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      changeStory(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      changeStory(1);
    }
  };

  const rankedRows = useMemo(() => {
    const visibleRows: DisplayAwardRow[] = awards
      .filter((award) => award.expand?.user_id?.ignore !== true)
      .map((award) => {
        const parsedScore = Number(award[story.category] ?? 0);

        return {
          id: award.id,
          score: Number.isFinite(parsedScore) ? parsedScore : 0,
          user: award.expand?.user_id,
          userId: award.user_id,
        };
      });

    return rankAwardRows(
      visibleRows.filter((row) => isAwardScoreEligible(row.score))
    );
  }, [awards, story.category]);

  const { podium, fourth } = useMemo(
    () => groupAwardRanks(rankedRows),
    [rankedRows]
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    swipeStart.current = undefined;
    swipeWasHandled.current = false;

    if ((event.target as HTMLElement).closest("a, button")) return;

    swipeStart.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!swipeStart.current) return;

    const distanceX = event.clientX - swipeStart.current.x;
    const distanceY = event.clientY - swipeStart.current.y;
    swipeStart.current = undefined;

    if (Math.abs(distanceX) <= Math.abs(distanceY)) {
      swipeWasHandled.current = Math.abs(distanceY) > 10;
      return;
    }

    if (Math.abs(distanceX) < SWIPE_THRESHOLD_PX) {
      swipeWasHandled.current = Math.abs(distanceX) > 10;
      return;
    }

    swipeWasHandled.current = true;
    changeStory(distanceX > 0 ? -1 : 1);
  };

  const handleStoryClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (swipeWasHandled.current) {
      swipeWasHandled.current = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if ((event.target as HTMLElement).closest("a, button")) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const tappedLeftSide = event.clientX - bounds.left < bounds.width / 2;
    changeStory(tappedLeftSide ? -1 : 1);
  };

  return (
    <>
      <Flex
        position="fixed"
        inset={0}
        zIndex="modal"
        minH="100dvh"
        flexDir="column"
        overflow="hidden"
        overscrollBehavior="contain"
        bg="gray.900"
        p={{ base: 0, sm: 3 }}
      >
        <Flex
          mb={3}
          gap={1}
          px={{ base: 2, sm: 0 }}
          pt={{ base: 2, sm: 0 }}
          aria-label={`Historia ${activeIndex + 1} de ${AWARD_STORIES.length}`}
        >
          {AWARD_STORIES.map((item, index) => {
            const isComplete = index < activeIndex;
            const isActive = index === activeIndex;

            return (
              <Box
                key={item.category}
                flex="1"
                h="4px"
                overflow="hidden"
                rounded="full"
                bg="border.subtle"
              >
                <Box
                  key={`${item.category}-${activeIndex}`}
                  h="100%"
                  bg="brand.400"
                  transformOrigin="left"
                  transform={isComplete ? "scaleX(1)" : "scaleX(0)"}
                  animation={
                    isActive
                      ? `${fillProgress} ${STORY_DURATION_MS}ms linear forwards`
                      : undefined
                  }
                  sx={{
                    animationPlayState: isPaused ? "paused" : "running",
                  }}
                />
              </Box>
            );
          })}
        </Flex>

        <Flex
          position="relative"
          flex="1"
          minH={0}
          w="100%"
          flexDir="column"
          overflowX="hidden"
          overflowY="auto"
          rounded={{ base: "none", sm: "2xl" }}
          bgGradient={story.gradient}
          color="white"
          boxShadow="xl"
          role="region"
          aria-roledescription="carrusel"
          aria-label={`${story.label}. Premio ${activeIndex + 1} de ${AWARD_STORIES.length}`}
          tabIndex={0}
          sx={{ touchAction: "pan-y" }}
          onClickCapture={handleStoryClick}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            swipeStart.current = undefined;
          }}
        >
          <Flex px={{ base: 4, sm: 6 }} pt={5} alignItems="start" gap={3}>
            <Text fontSize={{ base: "3xl", sm: "4xl" }} aria-hidden>
              {story.emoji}
            </Text>
            <Box minW={0} aria-live="polite">
              <Text
                color="whiteAlpha.800"
                fontFamily="mono"
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Premio {activeIndex + 1} de {AWARD_STORIES.length}
              </Text>
              <Heading size={{ base: "md", sm: "lg" }}>{story.label}</Heading>
              <Text color="whiteAlpha.800" fontSize="sm">
                {story.description}
              </Text>
            </Box>
            <Flex ml="auto" flexShrink={0} gap={2}>
              <IconButton
                aria-label={
                  isPaused ? "Reanudar historias" : "Pausar historias"
                }
                icon={isPaused ? <FiPlay /> : <FiPause />}
                onClick={togglePaused}
                rounded="full"
                color="white"
                bg="blackAlpha.400"
                _hover={{ bg: "blackAlpha.500" }}
              />
              <IconButton
                as={Link}
                to="/tournaments/$tournamentId"
                params={{ tournamentId }}
                aria-label="Cerrar premios"
                icon={<FiX />}
                rounded="full"
                color="white"
                bg="blackAlpha.400"
                _hover={{ bg: "blackAlpha.500" }}
              />
            </Flex>
          </Flex>

          {rankedRows.length > 0 && (
            <Grid
              flex="1"
              templateColumns="repeat(3, minmax(0, 1fr))"
              alignItems="end"
              gap={{ base: 1, sm: 3 }}
              px={{ base: 2, sm: 5 }}
              pt={5}
            >
              {PODIUM_DISPLAY_ORDER.map((rank) => {
                const entries = podium.get(rank);
                if (!entries?.length) return null;

                return (
                  <PodiumRank
                    key={rank}
                    entries={entries}
                    rank={rank}
                    tournamentId={tournamentId}
                  />
                );
              })}
            </Grid>
          )}

          {rankedRows.length === 0 && (
            <Flex flex="1" alignItems="center" justifyContent="center" px={6}>
              <Text textAlign="center" color="whiteAlpha.800">
                Todavía no hay resultados para este premio.
              </Text>
            </Flex>
          )}

          {fourth.length > 0 && (
            <Box
              mx={{ base: 3, sm: 6 }}
              mb={4}
              p={3}
              rounded="2xl"
              bg="blackAlpha.300"
              backdropFilter="blur(8px)"
            >
              <Text
                mb={2}
                fontFamily="mono"
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                4.º lugar
              </Text>
              <Flex gap={3} flexWrap="wrap">
                {fourth.map(({ row }) => (
                  <AwardParticipant
                    key={row.id}
                    compact
                    row={row}
                    tournamentId={tournamentId}
                  />
                ))}
              </Flex>
            </Box>
          )}

          <Flex justifyContent="center" gap={4} px={4} pb={4}>
            <IconButton
              aria-label="Premio anterior"
              icon={<FiChevronLeft />}
              onClick={() => changeStory(-1)}
              rounded="full"
              color="white"
              bg="blackAlpha.400"
              _hover={{ bg: "blackAlpha.500" }}
            />
            <IconButton
              aria-label="Siguiente premio"
              icon={<FiChevronRight />}
              onClick={() => changeStory(1)}
              rounded="full"
              color="white"
              bg="blackAlpha.400"
              _hover={{ bg: "blackAlpha.500" }}
            />
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}

function PodiumRank({
  entries,
  rank,
  tournamentId,
}: {
  entries: RankedAwardRow<DisplayAwardRow>[];
  rank: 1 | 2 | 3;
  tournamentId: string;
}) {
  const isFirst = rank === 1;
  const gridColumn = rank === 1 ? 2 : rank === 2 ? 1 : 3;
  const pedestalHeight = isFirst
    ? { base: "92px", sm: "120px" }
    : rank === 2
      ? { base: "68px", sm: "88px" }
      : { base: "52px", sm: "72px" };

  return (
    <Flex
      gridColumn={gridColumn}
      minW={0}
      flexDir="column"
      alignItems="stretch"
      justifyContent="flex-end"
      textAlign="center"
    >
      <Flex
        flexWrap="wrap"
        alignItems="flex-end"
        justifyContent="center"
        gap={2}
        pb={{ base: 2, sm: 3 }}
      >
        {entries.map(({ row }) => (
          <AwardParticipant
            key={row.id}
            row={row}
            tournamentId={tournamentId}
            isFirst={isFirst}
          />
        ))}
      </Flex>
      <Flex
        h={pedestalHeight}
        alignItems="center"
        justifyContent="center"
        roundedTop="2xl"
        borderWidth={isFirst ? "2px" : "1px"}
        borderColor="whiteAlpha.600"
        bg="whiteAlpha.300"
        backdropFilter="blur(8px)"
      >
        <VisuallyHidden>Puesto {rank}</VisuallyHidden>
        <Text
          aria-hidden
          fontFamily="mono"
          fontSize={{ base: "2xl", sm: "4xl" }}
          fontWeight="bold"
        >
          {rank}
        </Text>
      </Flex>
    </Flex>
  );
}

function AwardParticipant({
  compact = false,
  isFirst = false,
  row,
  tournamentId,
}: {
  compact?: boolean;
  isFirst?: boolean;
  row: DisplayAwardRow;
  tournamentId: string;
}) {
  const isCurrentUser = pb.authStore.model?.id === row.userId;
  const participantName =
    row.user?.name || row.user?.username || "Participante";

  return (
    <Link
      to="/tournaments/$tournamentId/$userId"
      params={{ tournamentId, userId: row.userId }}
      style={{ minWidth: 0, maxWidth: "100%" }}
    >
      <Flex
        minW={0}
        maxW="100%"
        flexDir={compact ? "row" : "column"}
        alignItems="center"
        gap={compact ? 2 : 1}
        p={compact ? 0 : 1}
        rounded="xl"
        boxShadow={isCurrentUser ? "0 0 0 2px white" : "none"}
      >
        <Avatar
          boxSize={
            compact
              ? "36px"
              : {
                  base: isFirst ? "58px" : "48px",
                  sm: isFirst ? "76px" : "62px",
                }
          }
          borderWidth={compact ? "2px" : "4px"}
          borderColor={isFirst ? "gold.200" : "whiteAlpha.700"}
          name={participantName}
          src={getAvatarUrl(row.user?.img, row.user?.username || row.userId)}
        />
        <Box minW={0} maxW="100%">
          <Text
            fontSize={compact ? "xs" : { base: "xs", sm: "sm" }}
            fontWeight="bold"
            noOfLines={1}
          >
            {participantName}
          </Text>
          <Text
            color="whiteAlpha.800"
            fontFamily="mono"
            fontSize="xs"
            fontWeight="bold"
          >
            {row.score} {row.score === 1 ? "acierto" : "aciertos"}
          </Text>
        </Box>
      </Flex>
    </Link>
  );
}

function getAvatarUrl(image: string | undefined, username: string) {
  return image
    ? image + "&thumb=100x100&cache=default"
    : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(username)}`;
}
