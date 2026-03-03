"""
Management command to seed the database with demo data from the frontend.

Usage:
    python manage.py seed_demo_data

This command is idempotent — it clears all existing data first.
"""

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.accounts.models import ActivationCode, User
from apps.members.models import MemberProfile, MemberSettings
from apps.forum.models import Channel, Topic, ForumPost, ForumReply
from apps.blog.models import BlogPost, BlogComment
from apps.marketplace.models import ListingTag, Listing, ListingReply
from apps.events.models import Event, EventAgendaItem, EventSpeaker, RSVP
from apps.notifications.models import Notification


# ---------------------------------------------------------------------------
# Data
# ---------------------------------------------------------------------------

MEMBERS = [
    {
        "slug": "margaret-h",
        "name": "Margaret H.",
        "location": "Savannah, GA",
        "state": "GA",
        "home_style": "Greek Revival",
        "home_year": 1842,
        "home_name": "The Holloway House",
        "bio": "Restoring a pre-Civil War home with original plasterwork and a two-story portico. Currently working on repointing the exterior brick.",
        "photo": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=600&fit=crop&crop=center",
        "tags": ["Restoration", "Gardens"],
        "member_since": "2024",
        "registry": "National Register of Historic Places",
        "story": [
            "Margaret purchased The Holloway House in 2018 after it had been in the same family for over a century. Built in 1842 by a cotton merchant, the home features a commanding two-story portico with fluted Doric columns, original plaster ceiling medallions in every room, and heart pine floors throughout.",
            "The biggest challenge has been the exterior brick. Decades of repointing with Portland cement had trapped moisture inside the soft, handmade bricks, causing spalling along the entire north wall. Margaret spent over a year finding a mason experienced with traditional lime mortar, and the repointing project is now about halfway complete.",
            "Inside, the original plasterwork has survived remarkably well. The double parlors retain their plaster cornices, center medallions, and original marble mantels. Margaret is working with a preservation consultant to document everything before beginning the next phase of interior work.",
            "The gardens, which once extended over two acres, have been a labor of love. Margaret has restored the original boxwood parterre garden using historic photographs from the Georgia Historical Society and is slowly replanting with period-appropriate species.",
        ],
    },
    {
        "slug": "james-w",
        "name": "James W.",
        "location": "Charleston, SC",
        "state": "SC",
        "home_style": "Queen Anne",
        "home_year": 1892,
        "home_name": "Whitfield Manor",
        "bio": "Owner of a Queen Anne Victorian with original gingerbread trim and stained glass transoms. Recently completed the federal tax credit process.",
        "photo": "https://images.unsplash.com/photo-1525883405167-fc4e76c7713a?w=600&h=600&fit=crop&crop=center",
        "tags": ["Victorian", "Tax Credits"],
        "member_since": "2024",
        "registry": "Charleston Historic District",
        "story": [
            "Whitfield Manor is one of Charleston's finest Queen Anne Victorians, built in 1892 for a prosperous shipping merchant. The home features elaborate gingerbread trim on all three porches, original stained glass transoms above every doorway, and a turret room with curved glass windows that look out over the harbor.",
            "James purchased the home in 2020 and immediately began the process of applying for the 20% Federal Historic Tax Credit. The documentation was intense \u2014 hundreds of photographs, detailed descriptions of every planned alteration, and months of back-and-forth with the State Historic Preservation Office. The credit was approved in late 2025.",
            "The restoration has focused on exterior preservation. The gingerbread trim had been painted over many times and several pieces were damaged or missing. James commissioned a local woodworker to create exact replicas of the missing pieces, matching the original patterns from fragments found in the attic.",
            "The interior retains its original layout with twelve-foot ceilings, pocket doors between the front and back parlors, and a grand staircase with a hand-carved newel post. James is currently restoring the original gas light fixtures, converting them to electric while maintaining their appearance.",
        ],
    },
    {
        "slug": "caroline-a",
        "name": "Caroline A.",
        "location": "Richmond, VA",
        "state": "VA",
        "home_style": "Italianate",
        "home_year": 1870,
        "home_name": "Ashby Place",
        "bio": "Meticulously restoring an Italianate townhome with ornamental cornices, marble mantels, and recently uncovered original pocket doors.",
        "photo": "https://images.unsplash.com/photo-1757992141434-983a12b82da3?w=600&h=600&fit=crop&crop=center",
        "tags": ["Plaster", "Ironwork"],
        "member_since": "2025",
        "registry": "Virginia Landmarks Register",
        "story": [
            "Ashby Place is an Italianate townhome built in 1870 in Richmond's Fan District. The home is notable for its ornamental pressed-metal cornices, elaborate cast-iron porch columns, and a particularly fine set of marble mantels imported from Italy.",
            "Caroline's most exciting discovery came during a bathroom renovation when contractors found a pair of solid walnut pocket doors sealed behind a partition wall. The doors were in remarkable condition \u2014 the original brass hardware was intact, and after three months of careful stripping and refinishing, they slide as smoothly as the day they were installed.",
            "The house has seven marble mantels, each with a different design. Two had been damaged by previous owners who had attempted DIY repairs with the wrong materials. Caroline worked with a stone conservator to properly repair and polish them, and the results are stunning.",
            "Current projects include restoring the cast-iron fence along the front of the property and addressing some settlement cracks in the plaster walls of the second floor. Caroline documents everything on the community forum and is always happy to share lessons learned.",
        ],
    },
    {
        "slug": "robert-e",
        "name": "Robert E.",
        "location": "New Orleans, LA",
        "state": "LA",
        "home_style": "Greek Revival",
        "home_year": 1856,
        "home_name": "Maison Ellison",
        "bio": "Preserving a Creole-influenced Greek Revival with 14-foot ceilings, original gas fixtures, and ornamental ceiling medallions.",
        "photo": "https://images.unsplash.com/photo-1519227355453-8f982e425321?w=600&h=600&fit=crop&crop=center",
        "tags": ["Medallions", "Creole"],
        "member_since": "2024",
        "registry": "National Register of Historic Places",
        "story": [
            "Maison Ellison sits in New Orleans' Garden District, built in 1856 in a distinctive Creole-influenced Greek Revival style. The home features fourteen-foot ceilings on both floors, original gas fixtures throughout, and some of the finest ornamental plaster ceiling medallions in the city.",
            "The medallions are the crown jewels of the house \u2014 each room has a unique design cast in place by itinerant Italian plasterers. Two of the medallions had developed serious cracks from foundation movement, and Robert spent months finding a specialist who could stabilize them without removing or replacing them.",
            "The home's Creole influences are visible in its side-hall plan, its deep galleries for shade, and the original cypress shutters that still function on every window. Robert has maintained the shutters by carefully stripping and repainting them every few years with traditional oil-based paint.",
            "Robert is active in the Preservation Resource Center of New Orleans and frequently opens his home for educational tours. He's currently working on restoring the original gas fixtures to working condition while adding concealed electric lighting for daily use.",
        ],
    },
    {
        "slug": "susan-p",
        "name": "Susan P.",
        "location": "Hudson, NY",
        "state": "NY",
        "home_style": "Dutch Colonial",
        "home_year": 1790,
        "home_name": "Stone Meadow Farm",
        "bio": "Owners of a late-18th-century stone farmhouse recently added to the National Register. Five generations of family history in these walls.",
        "photo": "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=600&h=600&fit=crop&crop=center",
        "tags": ["Farmhouse", "National Register"],
        "member_since": "2025",
        "registry": "National Register of Historic Places",
        "story": [
            "Stone Meadow Farm has been in Susan's family for five generations. Built in 1790 from locally quarried fieldstone, the house sits on twelve acres of rolling farmland along the Hudson River. The original Dutch Colonial design features a distinctive gambrel roof, massive central chimney, and wide-plank pine floors throughout.",
            "Getting the property listed on the National Register was a two-year process that involved extensive research into the home's history. Susan discovered through county deed records and census data that the original builder was a Dutch Reformed minister who also operated a small cooperage on the property. The stone foundation of the cooperage is still visible in the field behind the house.",
            "The biggest restoration challenge has been the roof. The original hand-split wood shingles had been replaced with asphalt in the 1960s, and Susan is now working to re-roof the entire structure with cedar shingles to match the original appearance. The project is being documented for the SHPO as part of the National Register listing.",
            "Inside, the house retains its original wide-plank floors, a cooking fireplace with a beehive oven, and hand-forged iron hardware on every door. Susan says every board tells a story \u2014 and she's working to write them all down for the next generation.",
        ],
    },
    {
        "slug": "david-c",
        "name": "David C.",
        "location": "San Francisco, CA",
        "state": "CA",
        "home_style": "Victorian",
        "home_year": 1895,
        "home_name": "The Chen Painted Lady",
        "bio": "Preserving one of the city's beloved Painted Ladies with seismic upgrades done sensitively to maintain the original character.",
        "photo": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&h=600&fit=crop&crop=center",
        "tags": ["Painted Lady", "Retrofit"],
        "member_since": "2024",
        "registry": "San Francisco Landmarks",
        "story": [
            "The Chen Painted Lady is one of San Francisco's most photographed Victorian homes, built in 1895 in the Stick-Eastlake style. The home features elaborate exterior ornamentation including sunburst panels, turned spindle work, and decorative brackets \u2014 all recently repainted in a historically accurate seven-color scheme.",
            "The most challenging aspect of owning a Victorian in San Francisco is the constant tension between seismic safety and preservation. David completed a mandatory soft-story retrofit in 2023, working with a structural engineer who specializes in historic buildings to strengthen the foundation and cripple walls without disturbing the original interior.",
            "The retrofit was done entirely from underneath the house \u2014 no interior walls were opened, no original plaster was disturbed, and all the original wood-frame windows remain in place. The project cost significantly more than a standard retrofit, but David considers it money well spent.",
            "David is currently researching the home's original paint colors using microscopic paint analysis. The current seven-color scheme dates from a 1980s restoration, and he suspects the original 1895 palette was quite different. Samples have been sent to a paint archaeologist in Portland for analysis.",
        ],
    },
    {
        "slug": "eleanor-m",
        "name": "Eleanor M.",
        "location": "Newport, RI",
        "state": "RI",
        "home_style": "Stick Style",
        "home_year": 1868,
        "home_name": "Cliffside Cottage",
        "bio": "Maintaining a rare Stick Style cottage overlooking the Rhode Island coastline. Currently restoring original wood windows.",
        "photo": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=600&fit=crop&crop=center",
        "tags": ["Coastal", "Windows"],
        "member_since": "2025",
        "registry": "Newport Historic District",
        "story": [
            "Cliffside Cottage is a rare surviving example of the Stick Style, built in 1868 as a summer cottage for a Providence textile manufacturer. The home features the style's characteristic decorative trusses, cross-bracing, and clapboard siding with board-and-batten accents that emphasize the underlying wooden structure.",
            "Eleanor's primary focus has been the windows. The cottage has thirty-two original wood windows, each with hand-blown glass panes. Rather than replacing them, Eleanor took a window restoration workshop through the Window Preservation Alliance and has been restoring them one by one \u2014 stripping old paint, re-glazing with traditional linseed oil putty, installing spring bronze weatherstripping, and repainting with oil-based primer and latex topcoat.",
            "After six months of weekend work, all thirty-two windows are complete. They operate smoothly, seal tightly, and look exactly as they did when new. Eleanor estimates the per-window cost at about $30\u201350 in materials, compared to $800\u20131,200 each for custom replacement windows.",
            "The coastal location presents ongoing maintenance challenges. Salt air accelerates paint failure, and Eleanor has adopted an aggressive repainting schedule to protect the elaborate exterior woodwork. She also works closely with the Newport Historic District Commission on all exterior changes.",
        ],
    },
    {
        "slug": "thomas-g",
        "name": "Thomas G.",
        "location": "Lexington, KY",
        "state": "KY",
        "home_style": "Federal",
        "home_year": 1835,
        "home_name": "Graves Hall",
        "bio": "A Federal-style brick home on a working horse farm with original fanlight doorways and hand-carved mantels throughout.",
        "photo": "https://images.unsplash.com/photo-1497219055242-93359eeed651?w=600&h=600&fit=crop&crop=center",
        "tags": ["Federal", "Brick"],
        "member_since": "2025",
        "registry": "Kentucky Heritage Council",
        "story": [
            "Graves Hall is a Federal-style brick home built in 1835 on what is still a working horse farm in the Bluegrass region of Kentucky. The home features the Federal style's hallmark symmetry \u2014 a center-hall plan flanked by matching parlors, with elegant fanlight transoms over every doorway.",
            "Thomas and his family have owned the property for twelve years, working through it room by room. The hand-carved mantels are the home's most distinctive feature \u2014 each of the six fireplaces has a unique mantel carved from local cherry wood, with delicate reeding, rosettes, and center tablets that are still as crisp as the day they were carved.",
            "The biggest challenge has been the exterior brick. Like many early Kentucky brick homes, Graves Hall was built with locally fired bricks that vary considerably in hardness. Some sections have weathered beautifully while others have spalled badly. Thomas is working with a mason experienced in historic lime mortar to repoint the worst sections while preserving the patina of the original work.",
            "The farm itself adds another layer of preservation. The property includes a stone springhouse, a log tobacco barn, and a board-and-batten carriage house, all dating from the 1830s\u20131850s. Thomas is documenting the entire complex for a potential National Register nomination.",
        ],
    },
    {
        "slug": "patricia-q",
        "name": "Patricia Q.",
        "location": "Portland, ME",
        "state": "ME",
        "home_style": "Cape Cod",
        "home_year": 1812,
        "home_name": "Quinn Homestead",
        "bio": "Restoring a timber-frame Cape Cod with a massive central chimney and original wide-plank floors. Every board tells a story.",
        "photo": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&h=600&fit=crop&crop=center",
        "tags": ["Timber Frame", "Hearth"],
        "member_since": "2024",
        "registry": "Maine Historic Preservation Commission",
        "story": [
            "The Quinn Homestead is a timber-frame Cape Cod built in 1812, one of the oldest surviving homes in Portland's West End neighborhood. The house retains its massive central chimney \u2014 which serves five fireplaces \u2014 original wide-plank pumpkin pine floors, and hand-hewn structural timbers joined with wooden pegs.",
            "Patricia's most pressing concern has been lead paint. With young children in the house, she needed a safe solution that wouldn't destroy the home's historic character. After extensive research, she chose encapsulation for low-traffic areas and full abatement for the children's bedrooms and the kitchen. The encapsulant (ECOBOND) has held up well for four years.",
            "The central chimney required rebuilding above the roofline after years of freeze-thaw cycles had loosened the bricks. A local mason rebuilt the exposed section using salvaged period bricks and traditional lime mortar, matching the original Flemish bond pattern perfectly.",
            "Patricia is passionate about timber-frame construction and has spent considerable time studying the joinery in her home's structure. The mortise-and-tenon joints are remarkably tight after two centuries, and she regularly leads informal tours for other Grist Club members interested in early American building techniques.",
        ],
    },
]

# Last member "william-b" only appears in the demo-data interface but let's check.
# Actually, there are only 9 members in allMembers. The user said 10 but the TS only has 9.
# We'll seed the 9 that exist.

EVENTS = [
    {
        "title": "Annual Members Retreat",
        "subtitle": "Savannah, Georgia",
        "description": "Three days of home tours, restoration workshops, and good company in one of America\u2019s most beautiful historic districts. This year we\u2019re visiting six privately-owned antebellum homes, with hands-on workshops on lime mortar, wood window repair, and navigating the federal tax credit process.",
        "date": "April 18\u201320, 2026",
        "time": "All day",
        "type": "In Person",
        "status": "upcoming",
        "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=700&fit=crop&crop=center",
        "spots": 60,
        "featured": True,
        "long_description": [
            "Join us in Savannah for the annual Grist Club members retreat \u2014 three days of home tours, hands-on workshops, and fellowship with fellow historic homeowners from across the country.",
            "This year\u2019s retreat is centered in Savannah\u2019s Landmark Historic District, one of the largest urban National Historic Landmark Districts in the United States. We\u2019ll visit six privately-owned antebellum homes whose owners have graciously opened their doors to share their restoration stories.",
            "Workshops will cover lime mortar repointing (led by a fourth-generation mason), wood window repair and weatherstripping, and a step-by-step walkthrough of the federal historic tax credit application process. All skill levels are welcome.",
            "Meals, lodging recommendations, and a welcome reception at a member\u2019s 1842 Greek Revival are all included in the registration. This is the highlight of the Grist Club calendar \u2014 a chance to learn, connect, and celebrate the homes we love.",
        ],
        "agenda": [
            {"time": "Friday 5:00 PM", "title": "Welcome reception at The Holloway House"},
            {"time": "Saturday 9:00 AM", "title": "Home tour: Three private antebellum homes"},
            {"time": "Saturday 1:00 PM", "title": "Workshop: Lime mortar repointing"},
            {"time": "Saturday 3:30 PM", "title": "Workshop: Wood window repair"},
            {"time": "Saturday 7:00 PM", "title": "Group dinner at a historic inn"},
            {"time": "Sunday 9:00 AM", "title": "Home tour: Three more private homes"},
            {"time": "Sunday 1:00 PM", "title": "Workshop: Federal tax credit process"},
            {"time": "Sunday 3:30 PM", "title": "Closing remarks and farewell"},
        ],
        "speaker": None,
    },
    {
        "title": "Monthly Member Meetup",
        "subtitle": "",
        "description": "A relaxed video call to connect with other members. Share what you\u2019re working on, ask questions, or just listen in.",
        "date": "March 14",
        "time": "7:00 PM ET",
        "type": "Virtual",
        "status": "upcoming",
        "image": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&h=900&fit=crop&crop=center",
        "spots": None,
        "featured": False,
        "long_description": [
            "Our monthly member meetup is a relaxed, unstructured video call where members can connect, share updates on their projects, ask for advice, or simply listen in.",
            "There\u2019s no formal agenda \u2014 just a group of people who care about old houses getting together to talk. Some months we end up deep in a discussion about paint colors; other months someone brings a specific question and the group problem-solves together.",
            "These meetups are consistently one of the most valued parts of membership. It\u2019s where relationships form, contractor recommendations get swapped, and moral support flows freely. Whether you\u2019re in the middle of a major renovation or just maintaining what you have, you\u2019re welcome.",
        ],
        "agenda": None,
        "speaker": None,
    },
    {
        "title": "Expert Q&A: Historic Windows",
        "subtitle": "",
        "description": "Window restoration specialist Thomas Clarke on repairing, weatherstripping, and maintaining original wood windows.",
        "date": "March 22",
        "time": "12:00 PM ET",
        "type": "Virtual",
        "status": "upcoming",
        "image": "https://images.unsplash.com/photo-1497219055242-93359eeed651?w=600&h=900&fit=crop&crop=center",
        "spots": None,
        "featured": False,
        "long_description": [
            "Window restoration specialist Thomas Clarke joins us for an in-depth Q&A on repairing, weatherstripping, and maintaining original wood windows in historic homes.",
            "Thomas has restored over 3,000 windows across New England and the Mid-Atlantic, from simple two-over-two sash to elaborate stained glass. He\u2019s a passionate advocate for repair over replacement, and his work has been featured in Old House Journal and This Old House.",
            "Topics will include: assessing window condition and deciding what can be saved, proper glazing compounds and techniques, spring bronze versus silicone weatherstripping, dealing with lead paint safely, and the energy performance of restored wood windows versus modern replacements.",
            "Bring your questions \u2014 and photos of your own windows if you\u2019d like specific advice. Thomas is generous with his time and always stays late to help members with individual situations.",
        ],
        "agenda": None,
        "speaker": {"name": "Thomas Clarke", "role": "Window restoration specialist, 25+ years experience"},
    },
    {
        "title": "Home Profile: The Holloway House",
        "subtitle": "",
        "description": "Margaret Holloway walks us through her 1842 Greek Revival \u2014 its history, the challenges, and the restoration journey.",
        "date": "April 5",
        "time": "6:00 PM ET",
        "type": "Virtual",
        "status": "upcoming",
        "image": "https://images.unsplash.com/photo-1750387354103-7c932c3c5a01?w=600&h=900&fit=crop&crop=center",
        "spots": None,
        "featured": False,
        "long_description": [
            "In this Home Profile session, member Margaret H. will walk us through the history and restoration of The Holloway House, her 1842 Greek Revival in Savannah, Georgia.",
            "Margaret will share the home\u2019s history \u2014 from its construction by a cotton merchant through the Civil War and into the present day. She\u2019ll show original photographs and documents she\u2019s uncovered through research at the Georgia Historical Society.",
            "The bulk of the presentation will focus on the ongoing restoration: the battle against Portland cement repointing, the discovery and preservation of original plaster ceiling medallions, and the painstaking work of replanting the historic boxwood garden.",
            "This is a chance to see a major restoration project from the inside \u2014 the decisions, the mistakes, the victories, and the ongoing challenges of living in a home that\u2019s nearly 200 years old.",
        ],
        "agenda": None,
        "speaker": None,
    },
    {
        "title": "Tax Credit Workshop",
        "subtitle": "",
        "description": "A step-by-step guide to applying for the 20% Federal Historic Tax Credit. Documentation, timelines, and common pitfalls.",
        "date": "April 12",
        "time": "11:00 AM ET",
        "type": "Virtual",
        "status": "upcoming",
        "image": "https://images.unsplash.com/photo-1757992141434-983a12b82da3?w=600&h=900&fit=crop&crop=center",
        "spots": None,
        "featured": False,
        "long_description": [
            "This workshop provides a comprehensive, step-by-step guide to applying for the 20% Federal Historic Tax Credit \u2014 one of the most valuable financial tools available to historic homeowners.",
            "Member James W. will share his recent experience successfully applying for the credit on his 1892 Queen Anne in Charleston. He\u2019ll cover the three-part application process, the documentation requirements (with real examples from his own submission), typical timelines, and the most common pitfalls that cause applications to be rejected or delayed.",
            "We\u2019ll also cover state-level tax credits, which can stack on top of the federal credit in many states, and discuss the role of preservation consultants \u2014 when they\u2019re worth the investment and when you can handle the process yourself.",
            "Whether you\u2019re actively considering applying or just want to understand the process for the future, this workshop will give you a clear roadmap.",
        ],
        "agenda": None,
        "speaker": None,
    },
    {
        "title": "Expert Q&A: Insurance for Historic Homes",
        "subtitle": "",
        "description": "David Hensley walked us through the ins and outs of insuring a historic property \u2014 replacement cost, riders, and what to ask your agent.",
        "date": "February 15",
        "time": "12:00 PM ET",
        "type": "Virtual",
        "status": "past",
        "image": "https://images.unsplash.com/photo-1519227355453-8f982e425321?w=600&h=900&fit=crop&crop=center",
        "spots": None,
        "featured": False,
        "long_description": [
            "Insurance specialist David Hensley joined us for an illuminating discussion about the unique challenges of insuring historic properties.",
            "Key takeaways included the importance of guaranteed replacement cost coverage (not just actual cash value), why you need a rider for architectural details that can\u2019t be replaced off the shelf, and specific questions to ask your insurance agent to make sure your policy actually covers what you think it covers.",
            "David also shared cautionary tales from his career \u2014 homes that were underinsured because owners didn\u2019t account for the cost of matching historic materials, and claims that were denied because alterations weren\u2019t properly documented.",
        ],
        "agenda": None,
        "speaker": {"name": "David Hensley", "role": "Historic property insurance specialist"},
    },
    {
        "title": "February Member Meetup",
        "subtitle": "",
        "description": "Our monthly gathering. Members shared winter projects and swapped contractor recommendations.",
        "date": "February 8",
        "time": "7:00 PM ET",
        "type": "Virtual",
        "status": "past",
        "image": "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=600&h=900&fit=crop&crop=center",
        "spots": None,
        "featured": False,
        "long_description": [
            "Our February meetup was a lively conversation focused on winter projects and contractor recommendations. Members from across the country shared what they\u2019ve been working on during the cold months.",
            "Highlights included a discussion of interior plaster repair techniques, a comparison of different wood consolidant products, and a spirited debate about the merits of storm windows versus interior weatherstripping.",
        ],
        "agenda": None,
        "speaker": None,
    },
    {
        "title": "Home Profile: Stone Meadow Farm",
        "subtitle": "",
        "description": "Susan P. shared the story of her 1790 Dutch Colonial farmhouse in Hudson, NY \u2014 from inheritance to National Register listing.",
        "date": "January 25",
        "time": "6:00 PM ET",
        "type": "Virtual",
        "status": "past",
        "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&h=900&fit=crop&crop=center",
        "spots": None,
        "featured": False,
        "long_description": [
            "Susan P. took us on a remarkable journey through the history of Stone Meadow Farm, her family\u2019s 1790 Dutch Colonial farmhouse in Hudson, New York.",
            "The presentation covered five generations of family stewardship, the painstaking research that went into the National Register nomination, and the practical challenges of maintaining a stone farmhouse in the Hudson Valley climate.",
            "Susan\u2019s research uncovered fascinating details about the original builder \u2014 a Dutch Reformed minister who also operated a cooperage on the property. The stone foundation of the workshop is still visible in the field behind the house.",
        ],
        "agenda": None,
        "speaker": None,
    },
    {
        "title": "Regional Meetup: New England",
        "subtitle": "",
        "description": "Members in the Northeast met in Portland, ME for home tours and lunch at a member\u2019s restored 1812 Cape Cod.",
        "date": "January 11",
        "time": "10:00 AM ET",
        "type": "In Person",
        "status": "past",
        "image": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=900&fit=crop&crop=center",
        "spots": None,
        "featured": False,
        "long_description": [
            "Fourteen members from across New England gathered in Portland, Maine for our first regional meetup of the year. The day centered on home tours and a shared lunch at the Quinn Homestead, Patricia Q.\u2019s beautifully restored 1812 Cape Cod.",
            "The group toured three historic homes in Portland\u2019s West End, each representing a different era and style. Discussions ranged from timber-frame construction techniques to modern approaches to lead paint remediation.",
            "The highlight was Patricia\u2019s demonstration of traditional mortise-and-tenon joinery in her home\u2019s exposed timber frame \u2014 a hands-on look at building techniques that have stood the test of two centuries.",
        ],
        "agenda": [
            {"time": "10:00 AM", "title": "Meet at the Quinn Homestead"},
            {"time": "10:30 AM", "title": "Tour: Three historic homes in the West End"},
            {"time": "12:30 PM", "title": "Lunch at the Quinn Homestead"},
            {"time": "2:00 PM", "title": "Timber-frame joinery demonstration"},
            {"time": "3:30 PM", "title": "Farewell and safe travels"},
        ],
        "speaker": None,
    },
]

CHANNELS = [
    {"name": "General", "slug": "general", "sort_order": 0},
    {"name": "Restoration Advice", "slug": "restoration-advice", "sort_order": 1},
    {"name": "Before & After", "slug": "before-and-after", "sort_order": 2},
    {"name": "Contractor Recs", "slug": "contractor-recs", "sort_order": 3},
    {"name": "Introductions", "slug": "introductions", "sort_order": 4},
]

TOPICS = [
    "Windows & Doors",
    "Tax Credits",
    "Insurance",
    "Lead Paint",
    "Plaster & Masonry",
]

FORUM_POSTS = [
    {
        "author_slug": "margaret-h",
        "channel_slug": "restoration-advice",
        "topics": ["Plaster & Masonry"],
        "title": "Repointing brick on an 1840s home \u2014 lime mortar vs. Portland?",
        "body": "Our mason is suggesting Portland cement but I\u2019ve read that lime mortar is more appropriate for pre-1920 construction. The bricks are soft handmade ones and I\u2019m worried about trapping moisture. Would love to hear from anyone who\u2019s been through this.",
        "image": "",
        "pinned": False,
        "replies": [
            {
                "author_slug": "james-w",
                "body": "Lime mortar is absolutely the right call for pre-1920 soft brick. Portland is too hard and will cause spalling. We used a natural hydraulic lime (NHL 3.5) on our 1892 Queen Anne and it\u2019s held up beautifully for three years now.",
            },
            {
                "author_slug": "robert-e",
                "body": "Same experience here. Our mason initially pushed Portland but we insisted on lime. The key is finding a mason who has actually worked with it before \u2014 the technique is different. Happy to share our guy\u2019s contact if you\u2019re near the Southeast.",
            },
            {
                "author_slug": "susan-p",
                "body": "The Preservation Brief #2 from the National Park Service has excellent guidance on this. It specifically warns against Portland cement on historic masonry. Worth printing out and handing to your mason.",
            },
        ],
    },
    {
        "author_slug": "james-w",
        "channel_slug": "general",
        "topics": ["Tax Credits"],
        "title": "Federal tax credit approved \u2014 happy to share the process",
        "body": "Just got our 20% credit approved on our 1892 Queen Anne. The documentation was intense but absolutely worth it. If anyone is considering it, I\u2019m happy to walk you through what worked for us.",
        "image": "",
        "pinned": True,
        "replies": [
            {
                "author_slug": "caroline-a",
                "body": "Congratulations! We\u2019re starting this process on our Italianate. Would you say the Part 2 application was the most time-consuming part? And did you use a consultant or handle it yourselves?",
            },
            {
                "author_slug": "james-w",
                "body": "Part 2 was definitely the most work \u2014 lots of before photos and detailed descriptions of what we planned to do. We used a preservation consultant for the application itself ($2,500) and it was worth every penny. They knew exactly what the reviewers look for.",
            },
        ],
    },
    {
        "author_slug": "caroline-a",
        "channel_slug": "before-and-after",
        "topics": ["Windows & Doors"],
        "title": "Restored original pocket doors in our 1870 Italianate",
        "body": "The hardware was all still intact behind the wall \u2014 just needed to be freed up and refinished. Three months of weekends but the result is incredible. The doors are solid walnut with original brass pulls.",
        "image": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=400&fit=crop&crop=center",
        "pinned": False,
        "replies": [
            {
                "author_slug": "eleanor-m",
                "body": "These are stunning! Did you strip and refinish them in place or were you able to remove them? We have a similar situation in our Stick Style cottage but the doors seem stuck in the wall cavity.",
            },
            {
                "author_slug": "caroline-a",
                "body": "We were able to remove them from the pocket by taking off the door casing on one side. The main issue was that decades of paint had sealed them in. A heat gun and patience got them free. Once out, we stripped them with Citristrip in the garage.",
            },
        ],
    },
    {
        "author_slug": "robert-e",
        "channel_slug": "contractor-recs",
        "topics": ["Plaster & Masonry"],
        "title": "Plaster specialist needed \u2014 New Orleans area",
        "body": "We have ornamental ceiling medallions in our 1856 Greek Revival that need stabilization. Two contractors have already told us to just tear it all out and drywall. Not happening. Looking for someone who knows historic plaster.",
        "image": "",
        "pinned": False,
        "replies": [
            {
                "author_slug": "margaret-h",
                "body": "Try reaching out to the Preservation Resource Center of New Orleans \u2014 they maintain a list of tradespeople experienced with historic homes. Also, Big Easy Plaster has done ornamental work on several properties in the Garden District.",
            },
        ],
    },
    {
        "author_slug": "susan-p",
        "channel_slug": "general",
        "topics": [],
        "title": "Our 1790 stone farmhouse just made the National Register",
        "body": "It\u2019s been a two-year process with our SHPO but we finally got the certification. The research into the home\u2019s history alone was worth the effort \u2014 we learned things about this property that five generations of owners never knew.",
        "image": "",
        "pinned": False,
        "replies": [
            {
                "author_slug": "thomas-g",
                "body": "Congratulations! That\u2019s a huge milestone. Did you work with a preservation consultant for the nomination, or did you handle the research and application yourself?",
            },
            {
                "author_slug": "susan-p",
                "body": "We did most of the research ourselves \u2014 county deed records, old maps, and census data. Our SHPO liaison was incredibly helpful and reviewed our drafts before submission. The whole process cost us about $800 in filing fees.",
            },
        ],
    },
    {
        "author_slug": "david-c",
        "channel_slug": "restoration-advice",
        "topics": ["Windows & Doors"],
        "title": "Earthquake retrofit without destroying original features?",
        "body": "We need to do a seismic upgrade on our 1895 Painted Lady. Has anyone done this while keeping the original plaster walls and wood-frame windows intact? Every contractor we\u2019ve talked to wants to gut the interior.",
        "image": "",
        "pinned": False,
        "replies": [
            {
                "author_slug": "patricia-q",
                "body": "Look into soft-story retrofit specialists who work on Victorians specifically. There are firms in the Bay Area that do foundation bolting and cripple wall bracing from underneath without touching the interior at all. The city\u2019s soft-story program should have a list.",
            },
        ],
    },
    {
        "author_slug": "eleanor-m",
        "channel_slug": "before-and-after",
        "topics": ["Windows & Doors"],
        "title": "Six months of window restoration \u2014 all 32 done",
        "body": "Finally finished restoring every original window in our 1868 Stick Style cottage. Stripped, reglazed, weatherstripped, and repainted. They work better than any modern replacement and they\u2019re gorgeous.",
        "image": "https://images.unsplash.com/photo-1497219055242-93359eeed651?w=800&h=400&fit=crop&crop=center",
        "pinned": False,
        "replies": [
            {
                "author_slug": "david-c",
                "body": "This is incredible and exactly the motivation I need. Did you do the work yourself or hire someone? And roughly what was the per-window cost?",
            },
            {
                "author_slug": "eleanor-m",
                "body": "All DIY! I took a window restoration workshop through the Window Preservation Alliance and then just went one by one. Materials cost about $30\u201350 per window \u2014 mainly glazing compound, weatherstrip, and paint. The glass was all original and in great shape.",
            },
        ],
    },
    {
        "author_slug": "thomas-g",
        "channel_slug": "introductions",
        "topics": [],
        "title": "New member \u2014 1835 Federal on a horse farm in Kentucky",
        "body": "Hi everyone. Just got verified. We\u2019ve owned this place for about twelve years and have been slowly working through it room by room. Original fanlight doorways, hand-carved mantels, and a lot of questions. Glad to be here.",
        "image": "",
        "pinned": False,
        "replies": [
            {
                "author_slug": "margaret-h",
                "body": "Welcome, Thomas! A Federal on a horse farm sounds like a dream. Would love to hear more about the mantels \u2014 are they original to the house? We have similar ones in our Greek Revival and they\u2019re one of our favorite features.",
            },
            {
                "author_slug": "james-w",
                "body": "Welcome! Twelve years of room-by-room work is the real deal. Looking forward to hearing about your projects. And definitely check out the #restoration-advice channel \u2014 great people in there.",
            },
        ],
    },
    {
        "author_slug": "patricia-q",
        "channel_slug": "restoration-advice",
        "topics": ["Insurance", "Lead Paint"],
        "title": "Lead paint encapsulation vs. abatement \u2014 what did you choose?",
        "body": "Our 1812 Cape Cod has lead paint throughout. We have young kids so we need to deal with it. Encapsulation is cheaper but I\u2019m worried about it peeling in a few years. What has worked for others in this situation?",
        "image": "",
        "pinned": False,
        "replies": [
            {
                "author_slug": "susan-p",
                "body": "We went with encapsulation in the rooms our kids don\u2019t use much and full abatement in their bedrooms and the kitchen. The encapsulant we used (ECOBOND) has held up for four years with no peeling. Key is proper surface prep before application.",
            },
        ],
    },
]

MICRO_POSTS = [
    {
        "author_slug": "margaret-h",
        "title": "North wall repointing is finally complete",
        "content": "The north wall repointing is finally complete. Six months of lime mortar work and every joint looks exactly right. The mason said it was one of the most satisfying projects he\u2019s done in years.",
        "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop&crop=center",
        "comments": [
            {
                "author_slug": "james-w",
                "body": "That looks incredible. Who was your mason? I need similar work done on our north-facing wall.",
            },
            {
                "author_slug": "caroline-a",
                "body": "Six months of patience paying off. The lime mortar is the only way to go with soft brick.",
            },
        ],
    },
    {
        "author_slug": "caroline-a",
        "title": "Original William Morris wallpaper found behind baseboard",
        "content": "Found original wallpaper samples behind the baseboard in the front parlor today. The pattern is a William Morris \u2018Willow Bough\u2019 \u2014 going to try to source a reproduction.",
        "image": "",
        "comments": [
            {
                "author_slug": "eleanor-m",
                "body": "Bradbury & Bradbury does beautiful Morris reproductions. They might have Willow Bough in their catalog.",
            },
        ],
    },
    {
        "author_slug": "james-w",
        "title": "Tax credit check arrived today",
        "content": "Tax credit check arrived today. Still can\u2019t believe the 20% federal credit actually worked out. If anyone is on the fence about applying, do it.",
        "image": "",
        "comments": [
            {
                "author_slug": "margaret-h",
                "body": "Congratulations! How long did the whole process take from application to check?",
            },
            {
                "author_slug": "james-w",
                "body": "About 14 months total. The documentation phase was the longest part. Happy to walk anyone through it.",
            },
        ],
    },
    {
        "author_slug": "eleanor-m",
        "title": "Window 28 of 32 is done",
        "content": "Window number 28 of 32 is done. Four more to go. My hands are permanently stained with glazing compound and I wouldn\u2019t have it any other way.",
        "image": "https://images.unsplash.com/photo-1497219055242-93359eeed651?w=800&h=500&fit=crop&crop=center",
        "comments": [],
    },
    {
        "author_slug": "margaret-h",
        "title": "Boxwood garden update",
        "content": "Boxwood garden update: the new plantings from last fall have taken root beautifully. Another year or two and the parterre will look like the 1890s photographs.",
        "image": "",
        "comments": [],
    },
]

LISTINGS = [
    {
        "author_slug": "margaret-h",
        "category": "for-sale",
        "title": "Salvaged 1840s heart pine flooring \u2014 200 sq ft",
        "description": "Pulled from a carriage house demolition down the street. Beautiful patina, tight grain, no rot. Boards are 8\u201310 inches wide, 3/4 inch thick. Pickup only in Savannah.",
        "price": "$1,200",
        "image": "https://images.unsplash.com/photo-1601063936640-a0e4e4ed081c?w=800&h=400&fit=crop&crop=center",
        "condition": "Good",
        "tags": ["Lumber"],
        "replies": [
            {
                "author_slug": "robert-e",
                "body": "That grain looks incredible. Is this longleaf pine? Would you be willing to ship if I covered freight?",
            },
            {
                "author_slug": "margaret-h",
                "body": "Yes, it\u2019s longleaf \u2014 you can tell by the tight grain. I\u2019d consider shipping for the right price. The boards are heavy though \u2014 probably 600+ lbs total.",
            },
        ],
    },
    {
        "author_slug": "james-w",
        "category": "wanted",
        "title": "Looking for Victorian-era brass door hinges (3.5\")",
        "description": "Need six matching pairs of 3.5-inch brass ball-tip hinges for our second-floor bedroom doors. Happy to buy reproductions if the quality is right, but would love originals if anyone has them.",
        "price": "",
        "image": "",
        "condition": "",
        "tags": ["Hardware", "Doors & Windows"],
        "replies": [
            {
                "author_slug": "eleanor-m",
                "body": "House of Antique Hardware has excellent reproductions. I\u2019ve used their ball-tip hinges on four doors and they\u2019re indistinguishable from originals.",
            },
        ],
    },
    {
        "author_slug": "caroline-a",
        "category": "free",
        "title": "Free: Cast iron radiators (4 units)",
        "description": "Removed during our HVAC conversion. All four are in working condition \u2014 just need sandblasting and a coat of paint. Various sizes. Must pick up from Richmond.",
        "price": "",
        "image": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&h=400&fit=crop&crop=center",
        "condition": "Fair",
        "tags": ["Fixtures"],
        "replies": [
            {
                "author_slug": "thomas-g",
                "body": "I\u2019d love to take two of these. Are any of them the ornate column style? We\u2019re looking to add radiators back to our Federal.",
            },
        ],
    },
    {
        "author_slug": "david-c",
        "category": "for-sale",
        "title": "Pair of original Victorian gas light fixtures \u2014 converted to electric",
        "description": "Two matching brass gas light wall sconces from our 1895 Painted Lady. Already professionally converted to electric with period-appropriate fabric cord. Beautiful etched glass shades included.",
        "price": "$850",
        "image": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&h=400&fit=crop&crop=center",
        "condition": "Good",
        "tags": ["Fixtures"],
        "replies": [],
    },
    {
        "author_slug": "susan-p",
        "category": "wanted",
        "title": "Seeking hand-forged iron door hardware \u2014 early 1800s style",
        "description": "Our 1790 farmhouse has original hand-forged iron latches and strap hinges on most doors, but three doors are missing their hardware. Looking for period-correct replacements \u2014 original or handmade reproductions.",
        "price": "",
        "image": "",
        "condition": "",
        "tags": ["Hardware", "Doors & Windows"],
        "replies": [
            {
                "author_slug": "patricia-q",
                "body": "There\u2019s a blacksmith in Vermont \u2014 Hammerworks \u2014 who does beautiful period reproduction hardware. Their Suffolk latches are nearly identical to what\u2019s in my 1812 Cape.",
            },
        ],
    },
    {
        "author_slug": "eleanor-m",
        "category": "for-sale",
        "title": "Salvaged marble mantel \u2014 Italianate style, circa 1870",
        "description": "White Carrara marble mantel with grey veining. Carved corbels and center tablet. Came from a townhouse demolition in Providence. Some minor chips on the hearth slab but the surround is in excellent condition.",
        "price": "$2,800",
        "image": "",
        "condition": "Good",
        "tags": ["Mantels & Fireplaces"],
        "replies": [
            {
                "author_slug": "caroline-a",
                "body": "This is gorgeous. Could you post dimensions? We have a parlor fireplace that lost its original surround decades ago and this looks like it could be a match.",
            },
        ],
    },
    {
        "author_slug": "thomas-g",
        "category": "free",
        "title": "Free: Antique brick \u2014 approximately 500 pieces",
        "description": "Hand-fired brick from a collapsed outbuilding on our property. Mixed sizes, some with beautiful weathering. Great for garden paths or small projects. You haul.",
        "price": "",
        "image": "",
        "condition": "Salvaged",
        "tags": ["Garden & Exterior"],
        "replies": [],
    },
    {
        "author_slug": "robert-e",
        "category": "for-sale",
        "title": "Original cypress shutters \u2014 6 pairs, various sizes",
        "description": "Removed from our 1856 Greek Revival during restoration. All operable with original pintles. Some need paint stripping but the wood is solid \u2014 cypress lasts forever. Priced per pair.",
        "price": "$350/pair",
        "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=400&fit=crop&crop=center",
        "condition": "Fair",
        "tags": ["Doors & Windows", "Garden & Exterior"],
        "replies": [
            {
                "author_slug": "david-c",
                "body": "Cypress shutters are gold. What are the window sizes? We might be able to use a couple pairs on our Painted Lady.",
            },
        ],
    },
    {
        "author_slug": "patricia-q",
        "category": "wanted",
        "title": "ISO: Wide-plank pumpkin pine boards for patching",
        "description": "Need about 30 square feet of 3/4-inch pumpkin pine to patch a couple of damaged areas in our 1812 Cape. Width needs to be 12 inches or wider to match the originals. Will pay well for the right match.",
        "price": "",
        "image": "",
        "condition": "",
        "tags": ["Lumber"],
        "replies": [],
    },
]

LISTING_TAGS = [
    "Hardware",
    "Fixtures",
    "Lumber",
    "Doors & Windows",
    "Mantels & Fireplaces",
    "Garden & Exterior",
]

NOTIFICATIONS = [
    {
        "type": "post_comment",
        "title": "James W. commented on your post",
        "body": "That looks incredible. Who was your mason? We need to repoint our south wall next spring.",
        "read": False,
        "href": "/m/blog/1",
        "actor_slug": "james-w",
    },
    {
        "type": "post_comment",
        "title": "Caroline A. commented on your post",
        "body": "Six months of patience paying off beautifully. The lime mortar match is spot on.",
        "read": False,
        "href": "/m/blog/1",
        "actor_slug": "caroline-a",
    },
    {
        "type": "post_like",
        "title": "Eleanor M. and 17 others liked your post",
        "body": "The north wall repointing is finally complete.",
        "read": False,
        "href": "/m/blog/1",
        "actor_slug": "eleanor-m",
    },
    {
        "type": "forum_reply",
        "title": "James W. replied to your forum post",
        "body": "Lime mortar is absolutely the right call for anything pre-1920. Portland cement will cause more damage long-term.",
        "read": False,
        "href": "/m/forum/1",
        "actor_slug": "james-w",
    },
    {
        "type": "event_reminder",
        "title": "Event tomorrow: Monthly Member Meetup",
        "body": "March 14 at 7:00 PM ET \u2014 Virtual",
        "read": False,
        "href": "/m/events/3",
        "actor_slug": None,
    },
    {
        "type": "forum_reply",
        "title": "Robert E. replied to your forum post",
        "body": "Same experience here. Our mason initially pushed Portland cement but we held firm on the lime mortar.",
        "read": True,
        "href": "/m/forum/1",
        "actor_slug": "robert-e",
    },
    {
        "type": "event_reminder",
        "title": "Reminder: Expert Q&A: Historic Windows",
        "body": "March 22 at 12:00 PM ET \u2014 You\u2019re registered",
        "read": True,
        "href": "/m/events/2",
        "actor_slug": None,
    },
    {
        "type": "new_member",
        "title": "Thomas G. joined Grist Club",
        "body": "1835 Federal in Lexington, KY",
        "read": True,
        "href": "/m/members/thomas-g",
        "actor_slug": "thomas-g",
    },
    {
        "type": "forum_reply",
        "title": "Susan P. replied to your forum post",
        "body": "The Preservation Brief #2 from the National Park Service has great guidance on repointing mortar joints.",
        "read": True,
        "href": "/m/forum/1",
        "actor_slug": "susan-p",
    },
    {
        "type": "new_member",
        "title": "Eleanor M. joined Grist Club",
        "body": "1868 Stick Style in Newport, RI",
        "read": True,
        "href": "/m/members/eleanor-m",
        "actor_slug": "eleanor-m",
    },
    {
        "type": "post_like",
        "title": "David C. liked your post",
        "body": "Found original 1842 wallpaper under six layers of paint in the parlor.",
        "read": True,
        "href": "/m/blog/2",
        "actor_slug": "david-c",
    },
    {
        "type": "welcome",
        "title": "Welcome to Grist Club!",
        "body": "Start by exploring the forum, connecting with other members, and RSVP-ing to upcoming events.",
        "read": True,
        "href": "/m/home",
        "actor_slug": None,
    },
]


class Command(BaseCommand):
    help = "Seed the database with demo data. Clears existing data first."

    def handle(self, *args, **options):
        self.stdout.write("Clearing existing data...")
        self._clear_data()

        self.stdout.write("Creating users and profiles...")
        users = self._create_users()

        self.stdout.write("Creating forum channels and topics...")
        channels = self._create_channels()
        topics = self._create_topics()

        self.stdout.write("Creating forum posts and replies...")
        self._create_forum_posts(users, channels, topics)

        self.stdout.write("Creating blog posts and comments...")
        self._create_blog_posts(users)

        self.stdout.write("Creating marketplace listings and replies...")
        self._create_listings(users)

        self.stdout.write("Creating events...")
        self._create_events()

        self.stdout.write("Creating notifications...")
        self._create_notifications(users)

        self.stdout.write("Creating activation codes...")
        self._create_activation_codes()

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully!"))

    def _clear_data(self):
        """Delete all existing demo-related data."""
        Notification.objects.all().delete()
        RSVP.objects.all().delete()
        EventSpeaker.objects.all().delete()
        EventAgendaItem.objects.all().delete()
        Event.objects.all().delete()
        ListingReply.objects.all().delete()
        Listing.objects.all().delete()
        ListingTag.objects.all().delete()
        BlogComment.objects.all().delete()
        BlogPost.objects.all().delete()
        ForumReply.objects.all().delete()
        ForumPost.objects.all().delete()
        Topic.objects.all().delete()
        Channel.objects.all().delete()
        MemberSettings.objects.all().delete()
        MemberProfile.objects.all().delete()
        ActivationCode.objects.all().delete()
        # Delete non-staff users (demo users)
        User.objects.filter(is_staff=False).delete()

    def _create_users(self):
        """Create User, MemberProfile, and MemberSettings for each member."""
        users = {}
        for m in MEMBERS:
            email = f"{m['slug']}@example.com"
            first_name = m["name"].split(".")[0].strip()
            user = User.objects.create_user(
                email=email,
                password="password123",
                first_name=first_name,
            )
            MemberProfile.objects.create(
                user=user,
                slug=m["slug"],
                name=m["name"],
                location=m["location"],
                state=m["state"],
                home_style=m["home_style"],
                home_year=m["home_year"],
                home_name=m["home_name"],
                bio=m["bio"],
                photo=m["photo"],
                tags=m["tags"],
                member_since=m["member_since"],
                registry=m["registry"],
                story=m["story"],
            )
            MemberSettings.objects.create(user=user)
            users[m["slug"]] = user
            self.stdout.write(f"  Created user: {email}")
        return users

    def _create_channels(self):
        """Create forum channels."""
        channels = {}
        for ch in CHANNELS:
            channel = Channel.objects.create(
                name=ch["name"],
                slug=ch["slug"],
                sort_order=ch["sort_order"],
            )
            channels[ch["slug"]] = channel
        return channels

    def _create_topics(self):
        """Create forum topics."""
        topics = {}
        for t in TOPICS:
            topic = Topic.objects.create(
                name=t,
                slug=slugify(t),
            )
            topics[t] = topic
        return topics

    def _create_forum_posts(self, users, channels, topics):
        """Create forum posts and replies."""
        for post_data in FORUM_POSTS:
            author = users[post_data["author_slug"]]
            channel = channels[post_data["channel_slug"]]
            post = ForumPost.objects.create(
                author=author,
                channel=channel,
                title=post_data["title"],
                body=post_data["body"],
                image=post_data["image"],
                pinned=post_data["pinned"],
            )
            for topic_name in post_data["topics"]:
                if topic_name in topics:
                    post.topics.add(topics[topic_name])

            for reply_data in post_data["replies"]:
                reply_author = users[reply_data["author_slug"]]
                ForumReply.objects.create(
                    post=post,
                    author=reply_author,
                    body=reply_data["body"],
                )

    def _create_blog_posts(self, users):
        """Create blog posts (MicroPosts) and comments."""
        for mp in MICRO_POSTS:
            author = users[mp["author_slug"]]
            blog_post = BlogPost.objects.create(
                author=author,
                title=mp["title"],
                content=mp["content"],
                image=mp.get("image", ""),
            )
            for comment_data in mp["comments"]:
                comment_author = users[comment_data["author_slug"]]
                BlogComment.objects.create(
                    post=blog_post,
                    author=comment_author,
                    body=comment_data["body"],
                )

    def _create_listings(self, users):
        """Create marketplace listing tags, listings, and replies."""
        # Create listing tags
        tag_objects = {}
        for tag_name in LISTING_TAGS:
            tag = ListingTag.objects.create(
                name=tag_name,
                slug=slugify(tag_name),
            )
            tag_objects[tag_name] = tag

        # Create listings
        for listing_data in LISTINGS:
            author = users[listing_data["author_slug"]]
            listing = Listing.objects.create(
                author=author,
                category=listing_data["category"],
                title=listing_data["title"],
                description=listing_data["description"],
                price=listing_data.get("price", ""),
                image=listing_data.get("image", ""),
                condition=listing_data.get("condition", ""),
            )
            for tag_name in listing_data["tags"]:
                if tag_name in tag_objects:
                    listing.tags.add(tag_objects[tag_name])

            for reply_data in listing_data["replies"]:
                reply_author = users[reply_data["author_slug"]]
                ListingReply.objects.create(
                    listing=listing,
                    author=reply_author,
                    body=reply_data["body"],
                )

    def _create_events(self):
        """Create events with agenda items and speakers."""
        for event_data in EVENTS:
            event = Event.objects.create(
                title=event_data["title"],
                subtitle=event_data.get("subtitle", ""),
                description=event_data["description"],
                long_description=event_data["long_description"],
                date=event_data["date"],
                time=event_data["time"],
                type=event_data["type"],
                status=event_data["status"],
                image=event_data["image"],
                spots=event_data.get("spots"),
                featured=event_data.get("featured", False),
            )

            # Create agenda items
            if event_data.get("agenda"):
                for idx, agenda_item in enumerate(event_data["agenda"]):
                    EventAgendaItem.objects.create(
                        event=event,
                        time=agenda_item["time"],
                        title=agenda_item["title"],
                        sort_order=idx,
                    )

            # Create speaker
            if event_data.get("speaker"):
                EventSpeaker.objects.create(
                    event=event,
                    name=event_data["speaker"]["name"],
                    role=event_data["speaker"]["role"],
                )

    def _create_notifications(self, users):
        """Create notifications for the first member (margaret-h)."""
        recipient = users["margaret-h"]
        for notif_data in NOTIFICATIONS:
            actor = None
            if notif_data.get("actor_slug"):
                actor = users.get(notif_data["actor_slug"])
            Notification.objects.create(
                recipient=recipient,
                actor=actor,
                type=notif_data["type"],
                title=notif_data["title"],
                body=notif_data["body"],
                href=notif_data["href"],
                read=notif_data["read"],
            )

    def _create_activation_codes(self):
        """Create demo activation codes."""
        for i in range(1, 6):
            ActivationCode.objects.create(
                code=f"GRIST-DEMO-{i:04d}",
                is_used=False,
            )
        self.stdout.write("  Created 5 activation codes: GRIST-DEMO-0001 through GRIST-DEMO-0005")
