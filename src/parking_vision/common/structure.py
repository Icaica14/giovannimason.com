"""Repository layout helpers for the parking vision sandbox."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class RepoLayout:
    """Canonical repository directories for the modular computer vision sandbox."""

    package_root: Path = Path("src/parking_vision")
    config_dir: Path = Path("config")
    docs_dir: Path = Path("docs")
    scripts_dir: Path = Path("scripts")
    tests_dir: Path = Path("tests")
    models_dir: Path = Path("models")
    data_dir: Path = Path("data")

    def package_directories(self) -> tuple[Path, ...]:
        """Return module directories in dependency-safe layering order."""

        return (
            self.package_root / "common",
            self.package_root / "detection",
            self.package_root / "tracking",
            self.package_root / "multicamera",
            self.package_root / "events",
            self.package_root / "registry",
            self.package_root / "video",
            self.package_root / "pipelines",
        )

    def working_directories(self) -> tuple[Path, ...]:
        """Return non-package directories needed for local workflows."""

        return (
            self.config_dir,
            self.docs_dir,
            self.scripts_dir,
            self.tests_dir,
            self.models_dir,
            self.data_dir / "raw",
            self.data_dir / "interim",
            self.data_dir / "processed",
            self.data_dir / "fixtures",
        )

    def all_directories(self) -> tuple[Path, ...]:
        """Return the full set of canonical repository directories."""

        return self.package_directories() + self.working_directories()


REPO_LAYOUT = RepoLayout()
